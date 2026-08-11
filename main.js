import http from "http";

import makeWASocket, {
    DisconnectReason,
    fetchLatestWaWebVersion,
    Browsers,
    initAuthCreds,
    BufferJSON,
    proto
} from "@whiskeysockets/baileys";

import QRCode from "qrcode";
import pg from "pg";

const { Pool } = pg;

const PORT = Number(process.env.PORT || 10000);

// ========================================
// Neon PostgreSQL
// ========================================

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("error", (error) => {
    console.error("PostgreSQL pool error:", error);
});

// ========================================
// Database
// ========================================

async function initDatabase() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS whatsapp_auth (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        )
    `);

    console.log("Neon database ready ✅");
}

// ========================================
// PostgreSQL Auth State
// ========================================

async function usePostgresAuthState() {

    async function readData(id) {
        const result = await pool.query(
            "SELECT data FROM whatsapp_auth WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return JSON.parse(
            JSON.stringify(result.rows[0].data),
            BufferJSON.reviver
        );
    }

    async function writeData(id, data) {
        const json = JSON.stringify(
            data,
            BufferJSON.replacer
        );

        await pool.query(
            `
            INSERT INTO whatsapp_auth (id, data)
            VALUES ($1, $2::jsonb)

            ON CONFLICT (id)
            DO UPDATE SET data = EXCLUDED.data
            `,
            [id, json]
        );
    }

    async function removeData(id) {
        await pool.query(
            "DELETE FROM whatsapp_auth WHERE id = $1",
            [id]
        );
    }

    let creds = await readData("creds");

    if (!creds) {
        creds = initAuthCreds();

        await writeData(
            "creds",
            creds
        );
    }

    const keys = {

        get: async (type, ids) => {

            const data = {};

            await Promise.all(
                ids.map(async (id) => {

                    const key =
                        `key-${type}-${id}`;

                    const value =
                        await readData(key);

                    if (value) {

                        if (
                            type ===
                            "app-state-sync-key"
                        ) {

                            data[id] =
                                proto.Message
                                    .AppStateSyncKeyData
                                    .fromObject(value);

                        } else {

                            data[id] = value;

                        }

                    } else {

                        data[id] = null;

                    }
                })
            );

            return data;
        },

        set: async (data) => {

            for (
                const category of Object.keys(data)
            ) {

                for (
                    const id of Object.keys(
                        data[category]
                    )
                ) {

                    const value =
                        data[category][id];

                    const key =
                        `key-${category}-${id}`;

                    if (value) {

                        await writeData(
                            key,
                            value
                        );

                    } else {

                        await removeData(
                            key
                        );

                    }
                }
            }
        }
    };

    return {
        state: {
            creds,
            keys
        },

        saveCreds: async () => {
            await writeData(
                "creds",
                creds
            );
        }
    };
}

// ========================================
// WhatsApp
// ========================================

let currentQR = null;
let currentStatus = "מתחבר...";
let sock = null;

let reconnectTimer = null;
let starting = false;

// ========================================
// Start WhatsApp
// ========================================

async function startWhatsApp() {

    if (starting) {
        console.log(
            "WhatsApp כבר בתהליך התחברות..."
        );

        return;
    }

    starting = true;

    try {

        console.log(
            "טוען WhatsApp Auth מ-Neon..."
        );

        const {
            state,
            saveCreds
        } = await usePostgresAuthState();

        console.log(
            "בודק גרסת WhatsApp Web..."
        );

        let version;

        try {

            const result =
                await fetchLatestWaWebVersion();

            version = result.version;

            console.log(
                `WhatsApp Web Version: ${version.join(".")}`
            );

        } catch (error) {

            console.warn(
                "לא הצלחנו לקבל גרסה עדכנית. ממשיך ללא version ידני."
            );

            console.warn(error.message);

            version = undefined;
        }

        const socketConfig = {
            auth: state,
            browser: Browsers.ubuntu(
                "Chrome"
            ),
            printQRInTerminal: false
        };

        if (version) {
            socketConfig.version = version;
        }

        // ========================================
        // חשוב:
        // יוצרים socket לפני שניגשים ל-sock.ev
        // ========================================

        const newSock =
            makeWASocket(socketConfig);

        sock = newSock;

        console.log(
            "Socket נוצר בהצלחה."
        );

        // ========================================
        // Credentials
        // ========================================

        sock.ev.on(
            "creds.update",
            async () => {

                try {

                    await saveCreds();

                    console.log(
                        "WhatsApp Auth נשמר ב-Neon ✅"
                    );

                } catch (error) {

                    console.error(
                        "שגיאה בשמירת Auth:",
                        error
                    );

                }
            }
        );

        // ========================================
        // Connection
        // ========================================

        sock.ev.on(
            "connection.update",
            async (update) => {

                const {
                    connection,
                    lastDisconnect,
                    qr
                } = update;

                // -----------------------------
                // QR
                // -----------------------------

                if (qr) {

                    try {

                        currentQR =
                            await QRCode.toDataURL(
                                qr
                            );

                        currentStatus =
                            "ממתין לסריקת QR";

                        console.log(
                            "QR חדש מוכן ב-/qr"
                        );

                    } catch (error) {

                        console.error(
                            "שגיאה ביצירת QR:",
                            error
                        );

                    }
                }

                // -----------------------------
                // Connecting
                // -----------------------------

                if (
                    connection ===
                    "connecting"
                ) {

                    currentStatus =
                        "מתחבר...";

                    console.log(
                        "מתחבר ל-WhatsApp..."
                    );
                }

                // -----------------------------
                // Open
                // -----------------------------

                if (
                    connection ===
                    "open"
                ) {

                    currentQR = null;

                    currentStatus =
                        "מחובר ✅";

                    starting = false;

                    console.log(
                        "WhatsApp מחובר! ✅"
                    );

                    // -----------------------------
                    // הצגת קבוצות
                    // -----------------------------

                    try {

                        const groups =
                            await sock
                                .groupFetchAllParticipating();

                        console.log(
                            "===== הקבוצות שלי ====="
                        );

                        for (
                            const group
                            of Object.values(groups)
                        ) {

                            console.log(
                                `שם: ${group.subject} | JID: ${group.id}`
                            );

                        }

                        console.log(
                            "========================"
                        );

                    } catch (error) {

                        console.error(
                            "שגיאה בקבלת קבוצות:",
                            error
                        );

                    }
                }

                // -----------------------------
                // Close
                // -----------------------------

                if (
                    connection ===
                    "close"
                ) {

                    currentQR = null;

                    currentStatus =
                        "מנותק";

                    starting = false;

                    const statusCode =
                        lastDisconnect
                            ?.error
                            ?.output
                            ?.statusCode;

                    console.log(
                        `WhatsApp התנתק. קוד: ${statusCode}`
                    );

                    // Socket ישן
                    sock = null;

                    // -----------------------------
                    // Logged out
                    // -----------------------------

                    if (
                        statusCode ===
                        DisconnectReason.loggedOut
                    ) {

                        currentStatus =
                            "התנתק לצמיתות — יש לחבר מחדש";

                        console.log(
                            "WhatsApp נותק לצמיתות."
                        );

                        return;
                    }

                    // -----------------------------
                    // Restart required
                    // -----------------------------

                    if (
                        statusCode ===
                        DisconnectReason.restartRequired
                    ) {

                        console.log(
                            "WhatsApp דורש אתחול. מתחבר מחדש..."
                        );

                    } else {

                        console.log(
                            "מנסה להתחבר מחדש בעוד 5 שניות..."
                        );

                    }

                    if (reconnectTimer) {
                        clearTimeout(
                            reconnectTimer
                        );
                    }

                    reconnectTimer =
                        setTimeout(
                            () => {

                                reconnectTimer =
                                    null;

                                startWhatsApp();

                            },
                            5000
                        );
                }
            }
        );

        // ========================================
        // Messages
        // ========================================

        sock.ev.on(
            "messages.upsert",
            async ({
                messages,
                type
            }) => {

                try {

                    if (
                        !messages ||
                        messages.length === 0
                    ) {
                        return;
                    }

                    for (
                        const message
                        of messages
                    ) {

                        if (
                            !message?.message
                        ) {
                            continue;
                        }

                        if (
                            message.key?.fromMe
                        ) {
                            continue;
                        }

                        const remoteJid =
                            message.key
                                ?.remoteJid;

                        if (!remoteJid) {
                            continue;
                        }

                        const text =
                            message.message
                                ?.conversation ||
                            message.message
                                ?.extendedTextMessage
                                ?.text ||
                            "";

                        if (!text) {
                            continue;
                        }

                        console.log(
                            `התקבלה הודעה (${type}):`,
                            text
                        );

                        // ========================================
                        // בדיקה זמנית של Rider
                        // ========================================

                        if (
                            text
                                .toLowerCase()
                                .includes("rider")
                        ) {

                            if (
                                !sock
                            ) {
                                return;
                            }

                            await sock.sendMessage(
                                remoteJid,
                                {
                                    text:
                                        "📱 Rider זוהה! 🚀"
                                }
                            );

                            console.log(
                                "תגובה נשלחה ✅"
                            );
                        }
                    }

                } catch (error) {

                    console.error(
                        "שגיאה בעיבוד הודעה:",
                        error
                    );

                }
            }
        );

    } catch (error) {

        starting = false;

        sock = null;

        currentStatus =
            "שגיאה בחיבור";

        console.error(
            "שגיאה בהפעלת WhatsApp:",
            error
        );

        if (reconnectTimer) {
            clearTimeout(
                reconnectTimer
            );
        }

        reconnectTimer =
            setTimeout(
                () => {

                    reconnectTimer =
                        null;

                    startWhatsApp();

                },
                10000
            );
    }
}

// ========================================
// HTTP Server
// ========================================

const server =
    http.createServer(
        async (req, res) => {

            // ========================================
            // Home
            // ========================================

            if (req.url === "/") {

                res.writeHead(
                    200,
                    {
                        "Content-Type":
                            "text/html; charset=utf-8"
                    }
                );

                res.end(`
                    <!DOCTYPE html>

                    <html lang="he">

                    <head>
                        <meta charset="UTF-8">

                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1"
                        >

                        <title>
                            WhatsApp Bot
                        </title>
                    </head>

                    <body>

                        <h1>
                            WhatsApp Bot 🤖
                        </h1>

                        <p>
                            סטטוס:
                            <strong>
                                ${currentStatus}
                            </strong>
                        </p>

                        <p>
                            <a href="/qr">
                                פתיחת QR
                            </a>
                        </p>

                    </body>

                    </html>
                `);

                return;
            }

            // ========================================
            // QR
            // ========================================

            if (req.url === "/qr") {

                if (!currentQR) {

                    res.writeHead(
                        200,
                        {
                            "Content-Type":
                                "text/html; charset=utf-8"
                        }
                    );

                    res.end(`
                        <!DOCTYPE html>

                        <html lang="he">

                        <head>

                            <meta charset="UTF-8">

                            <meta
                                http-equiv="refresh"
                                content="3"
                            >

                            <title>
                                WhatsApp QR
                            </title>

                        </head>

                        <body>

                            <h2>
                                ${currentStatus}
                            </h2>

                            <p>
                                מחכה ל-QR...
                            </p>

                            <p>
                                הדף יתרענן אוטומטית.
                            </p>

                        </body>

                        </html>
                    `);

                    return;
                }

                res.writeHead(
                    200,
                    {
                        "Content-Type":
                            "text/html; charset=utf-8"
                    }
                );

                res.end(`
                    <!DOCTYPE html>

                    <html lang="he">

                    <head>

                        <meta charset="UTF-8">

                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1"
                        >

                        <title>
                            WhatsApp QR
                        </title>

                        <style>

                            body {
                                font-family:
                                    Arial,
                                    sans-serif;

                                text-align:
                                    center;

                                padding:
                                    30px;
                            }

                            img {
                                width:
                                    300px;

                                max-width:
                                    90%;
                            }

                        </style>

                    </head>

                    <body>

                        <h2>
                            סרוק את ה-QR עם WhatsApp 📱
                        </h2>

                        <img
                            src="${currentQR}"
                            alt="WhatsApp QR Code"
                        >

                        <p>
                            לאחר הסריקה אפשר
                            לרענן את הדף.
                        </p>

                    </body>

                    </html>
                `);

                return;
            }

            // ========================================
            // Health
            // ========================================

            if (req.url === "/health") {

                res.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/json; charset=utf-8"
                    }
                );

                res.end(
                    JSON.stringify({
                        status:
                            currentStatus,
                        whatsapp:
                            Boolean(sock)
                    })
                );

                return;
            }

            // ========================================
            // 404
            // ========================================

            res.writeHead(
                404,
                {
                    "Content-Type":
                        "text/plain; charset=utf-8"
                }
            );

            res.end(
                "Not found"
            );
        }
    );

// ========================================
// Start HTTP
// ========================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server is running on port ${PORT}`
        );

    }
);

// ========================================
// Main
// ========================================

async function main() {

    try {

        await initDatabase();

        await startWhatsApp();

    } catch (error) {

        console.error(
            "שגיאה בהפעלת המערכת:",
            error
        );

    }
}

main();
