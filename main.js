```javascript
import http from "http";

import makeWASocket, {
    DisconnectReason,
    BufferJSON,
    initAuthCreds,
    proto,
    Browsers
} from "@whiskeysockets/baileys";

import QRCode from "qrcode";
import pg from "pg";

const { Pool } = pg;

// =====================================================
// CONFIG
// =====================================================

const PORT = Number(process.env.PORT || 10000);

const DATABASE_URL = process.env.DATABASE_URL;

// אופציונלי:
// אם תשים כאן JID של קבוצה, הבוט יגיב רק שם.
// לדוגמה:
// ALLOWED_GROUP_JID=120363xxxxxxxx@g.us
const ALLOWED_GROUP_JID =
    process.env.ALLOWED_GROUP_JID || "";

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL לא מוגדר ב-Render");
    process.exit(1);
}

// =====================================================
// NEON POSTGRESQL
// =====================================================

const pool = new Pool({
    connectionString: DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    },

    max: 5,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000
});

// =====================================================
// DATABASE INIT
// =====================================================

async function initDatabase() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS whatsapp_auth (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        )
    `);

    console.log("Neon database ready ✅");
}

// =====================================================
// POSTGRES AUTH STATE
// =====================================================

async function usePostgresAuthState() {

    async function readData(id) {

        const result = await pool.query(
            `
            SELECT data
            FROM whatsapp_auth
            WHERE id = $1
            `,
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
            `
            DELETE FROM whatsapp_auth
            WHERE id = $1
            `,
            [id]
        );
    }

    // =================================================
    // CREDENTIALS
    // =================================================

    let creds = await readData("creds");

    if (!creds) {

        console.log("אין Auth קיים — יוצר Auth חדש...");

        creds = initAuthCreds();

        await writeData(
            "creds",
            creds
        );
    }

    // =================================================
    // KEY STORE
    // =================================================

    const keys = {

        get: async (type, ids) => {

            const data = {};

            await Promise.all(
                ids.map(async (id) => {

                    const key =
                        `key-${type}-${id}`;

                    const value =
                        await readData(key);

                    if (!value) {

                        data[id] = null;

                        return;
                    }

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

// =====================================================
// WHATSAPP STATE
// =====================================================

let sock = null;

let currentQR = null;

let currentStatus =
    "מאתחל...";

let reconnectTimer = null;

let starting = false;

// =====================================================
// START WHATSAPP
// =====================================================

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

        currentStatus =
            "מתחבר ל-WhatsApp...";

        console.log(
            "מתחבר ל-WhatsApp..."
        );

        // =================================================
        // CREATE SOCKET
        // =================================================

        const newSock = makeWASocket({

            auth: state,

            browser:
                Browsers.ubuntu("Chrome"),

            printQRInTerminal: false,

            markOnlineOnConnect: false,

            syncFullHistory: false
        });

        sock = newSock;

        // =================================================
        // SAVE CREDENTIAL CHANGES
        // =================================================

        sock.ev.on(
            "creds.update",
            saveCreds
        );

        // =================================================
        // CONNECTION
        // =================================================

        sock.ev.on(
            "connection.update",
            async (update) => {

                const {
                    connection,
                    lastDisconnect,
                    qr
                } = update;

                // =========================================
                // QR
                // =========================================

                if (qr) {

                    try {

                        currentQR =
                            await QRCode.toDataURL(
                                qr
                            );

                        currentStatus =
                            "ממתין לסריקת QR";

                        console.log(
                            "📱 QR חדש זמין ב-/qr"
                        );

                    } catch (error) {

                        console.error(
                            "❌ שגיאה ביצירת QR:",
                            error
                        );
                    }
                }

                // =========================================
                // CONNECTING
                // =========================================

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

                // =========================================
                // OPEN
                // =========================================

                if (
                    connection ===
                    "open"
                ) {

                    starting = false;

                    currentQR = null;

                    currentStatus =
                        "מחובר ✅";

                    console.log(
                        "================================"
                    );

                    console.log(
                        "WhatsApp מחובר! ✅"
                    );

                    console.log(
                        "================================"
                    );

                    // =====================================
                    // SHOW GROUPS
                    // =====================================

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
                            "❌ שגיאה בקבלת קבוצות:",
                            error
                        );
                    }
                }

                // =========================================
                // CLOSE
                // =========================================

                if (
                    connection ===
                    "close"
                ) {

                    starting = false;

                    currentQR = null;

                    currentStatus =
                        "מנותק";

                    const statusCode =
                        lastDisconnect
                            ?.error
                            ?.output
                            ?.statusCode;

                    console.log(
                        `WhatsApp התנתק. קוד: ${statusCode}`
                    );

                    // =====================================
                    // LOGGED OUT
                    // =====================================

                    if (
                        statusCode ===
                        DisconnectReason.loggedOut
                    ) {

                        currentStatus =
                            "התנתק לצמיתות — יש לסרוק QR מחדש";

                        console.log(
                            "❌ החשבון התנתק מ-WhatsApp."
                        );

                        sock = null;

                        return;
                    }

                    // =====================================
                    // RECONNECT
                    // =====================================

                    console.log(
                        "מנסה להתחבר מחדש בעוד 5 שניות..."
                    );

                    currentStatus =
                        "מנותק — מנסה להתחבר מחדש...";

                    sock = null;

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

        // =================================================
        // MESSAGES
        // =================================================

        sock.ev.on(
            "messages.upsert",
            async ({
                messages,
                type
            }) => {

                try {

                    if (
                        type !==
                        "notify"
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

                        // =================================
                        // IGNORE STATUS
                        // =================================

                        if (
                            remoteJid ===
                            "status@broadcast"
                        ) {
                            continue;
                        }

                        // =================================
                        // GROUP FILTER
                        // =================================

                        if (
                            ALLOWED_GROUP_JID &&
                            remoteJid !==
                            ALLOWED_GROUP_JID
                        ) {

                            continue;
                        }

                        // =================================
                        // TEXT EXTRACTION
                        // =================================

                        const text =
                            message.message
                                ?.conversation ||

                            message.message
                                ?.extendedTextMessage
                                ?.text ||

                            message.message
                                ?.imageMessage
                                ?.caption ||

                            message.message
                                ?.videoMessage
                                ?.caption ||

                            "";

                        if (!text) {
                            continue;
                        }

                        const cleanText =
                            text.trim();

                        console.log(
                            `📩 הודעה מ-${remoteJid}: ${cleanText}`
                        );

                        // =================================
                        // RIDER
                        // =================================

                        if (
                            cleanText
                                .toLowerCase()
                                .includes("rider")
                        ) {

                            await sock.sendMessage(
                                remoteJid,
                                {
                                    text:
                                        "📱 Rider זוהה! 🚀"
                                }
                            );

                            console.log(
                                "✅ תגובת Rider נשלחה"
                            );
                        }
                    }

                } catch (error) {

                    console.error(
                        "❌ שגיאה בעיבוד הודעה:",
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
            "❌ שגיאה בהפעלת WhatsApp:",
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

// =====================================================
// HTTP SERVER
// =====================================================

const server =
    http.createServer(
        async (req, res) => {

            // =================================================
            // HOME
            // =================================================

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

            // =================================================
            // STATUS
            // =================================================

            if (req.url === "/status") {

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

                        connected:
                            currentStatus ===
                            "מחובר ✅"
                    })
                );

                return;
            }

            // =================================================
            // QR
            // =================================================

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

                        <meta
                            http-equiv="refresh"
                            content="20"
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

                                border:
                                    1px solid #ddd;

                                border-radius:
                                    12px;
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
                            לאחר הסריקה ה-QR ייעלם.
                        </p>

                    </body>

                    </html>
                `);

                return;
            }

            // =================================================
            // 404
            // =================================================

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

// =====================================================
// START HTTP
// =====================================================

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server is running on port ${PORT}`
        );
    }
);

// =====================================================
// START APP
// =====================================================

async function main() {

    try {

        await initDatabase();

        await startWhatsApp();

    } catch (error) {

        console.error(
            "❌ שגיאה בהפעלת המערכת:",
            error
        );

        process.exit(1);
    }
}

main();
```
