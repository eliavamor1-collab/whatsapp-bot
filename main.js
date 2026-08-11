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

// ========================================
// Configuration
// ========================================

const PORT = Number(
    process.env.PORT || 10000
);

const TARGET_GROUP_NAME =
    "פרוץ בווצאפ";

const TARGET_GROUP_JID =
    "120363410444900210@g.us";

// ========================================
// Neon PostgreSQL
// ========================================

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is missing"
    );
}

const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL,

    ssl: {
        rejectUnauthorized: false
    },

    max: 5,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000
});

pool.on(
    "error",
    (error) => {
        console.error(
            "PostgreSQL pool error:",
            error
        );
    }
);

// ========================================
// Database initialization
// ========================================

async function initDatabase() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS whatsapp_auth (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL
        )
    `);

    console.log(
        "Neon database ready ✅"
    );
}

// ========================================
// PostgreSQL Auth State
// ========================================

async function usePostgresAuthState() {

    async function readData(id) {

        const result =
            await pool.query(
                "SELECT data FROM whatsapp_auth WHERE id = $1",
                [id]
            );

        if (
            result.rows.length === 0
        ) {
            return null;
        }

        return JSON.parse(
            JSON.stringify(
                result.rows[0].data
            ),
            BufferJSON.reviver
        );
    }

    async function writeData(
        id,
        data
    ) {

        const json =
            JSON.stringify(
                data,
                BufferJSON.replacer
            );

        await pool.query(
            `
            INSERT INTO whatsapp_auth
                (id, data)

            VALUES
                ($1, $2::jsonb)

            ON CONFLICT (id)

            DO UPDATE SET
                data = EXCLUDED.data
            `,
            [
                id,
                json
            ]
        );
    }

    async function removeData(id) {

        await pool.query(
            "DELETE FROM whatsapp_auth WHERE id = $1",
            [id]
        );
    }

    // ========================================
    // Credentials
    // ========================================

    let creds =
        await readData("creds");

    if (!creds) {

        console.log(
            "אין Auth קיים — יוצר התחברות חדשה..."
        );

        creds =
            initAuthCreds();

        await writeData(
            "creds",
            creds
        );
    }

    // ========================================
    // Signal Keys
    // ========================================

    const keys = {

        get: async (
            type,
            ids
        ) => {

            const data = {};

            await Promise.all(
                ids.map(
                    async (id) => {

                        const key =
                            `key-${type}-${id}`;

                        const value =
                            await readData(
                                key
                            );

                        if (!value) {

                            data[id] =
                                null;

                            return;
                        }

                        if (
                            type ===
                            "app-state-sync-key"
                        ) {

                            data[id] =
                                proto.Message
                                    .AppStateSyncKeyData
                                    .fromObject(
                                        value
                                    );

                        } else {

                            data[id] =
                                value;
                        }
                    }
                )
            );

            return data;
        },

        set: async (
            data
        ) => {

            for (
                const category
                of Object.keys(data)
            ) {

                for (
                    const id
                    of Object.keys(
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

        saveCreds:
            async () => {

                await writeData(
                    "creds",
                    creds
                );
            }
    };
}

// ========================================
// WhatsApp State
// ========================================

let currentQR = null;

let currentStatus =
    "מתחבר...";

let sock = null;

let reconnectTimer =
    null;

let starting =
    false;

// ========================================
// IDs of messages sent by the bot
// Used to prevent response loops
// ========================================

const botSentMessageIds =
    new Set();

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
        } =
            await usePostgresAuthState();

        console.log(
            "בודק גרסת WhatsApp Web..."
        );

        let version;

        try {

            const result =
                await fetchLatestWaWebVersion();

            version =
                result.version;

            console.log(
                `WhatsApp Web Version: ${version.join(".")}`
            );

        } catch (error) {

            console.warn(
                "לא הצלחנו לקבל גרסת WhatsApp Web."
            );

            console.warn(
                error?.message ||
                error
            );

            version =
                undefined;
        }

        // ========================================
        // Socket configuration
        // ========================================

        const socketConfig = {

            auth: state,

            browser:
                Browsers.ubuntu(
                    "Chrome"
                ),

            printQRInTerminal:
                false,

            shouldSyncHistoryMessage:
                () => false
        };

        if (version) {

            socketConfig.version =
                version;
        }

        // ========================================
        // Create socket
        // ========================================

        const newSock =
            makeWASocket(
                socketConfig
            );

        sock =
            newSock;

        console.log(
            "Socket נוצר בהצלחה."
        );

        // ========================================
        // Credentials update
        // ========================================

        sock.ev.on(
            "creds.update",
            async () => {

                try {

                    await saveCreds();

                } catch (error) {

                    console.error(
                        "שגיאה בשמירת Auth:",
                        error
                    );
                }
            }
        );

        // ========================================
        // Connection updates
        // ========================================

        sock.ev.on(
            "connection.update",
            async (
                update
            ) => {

                const {
                    connection,
                    lastDisconnect,
                    qr
                } = update;

                // ========================================
                // QR
                // ========================================

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

                // ========================================
                // Connecting
                // ========================================

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

                // ========================================
                // Connected
                // ========================================

                if (
                    connection ===
                    "open"
                ) {

                    currentQR =
                        null;

                    currentStatus =
                        `מחובר ✅ | קבוצה: ${TARGET_GROUP_NAME}`;

                    starting =
                        false;

                    console.log(
                        "========================================"
                    );

                    console.log(
                        "WhatsApp מחובר! ✅"
                    );

                    console.log(
                        `קבוצת יעד: ${TARGET_GROUP_NAME}`
                    );

                    console.log(
                        `JID: ${TARGET_GROUP_JID}`
                    );

                    console.log(
                        "========================================"
                    );
                }

                // ========================================
                // Disconnected
                // ========================================

                if (
                    connection ===
                    "close"
                ) {

                    currentQR =
                        null;

                    currentStatus =
                        "מנותק";

                    starting =
                        false;

                    console.log(
                        `WhatsApp התנתק.`
                    );

                    const statusCode =
                        lastDisconnect
                            ?.error
                            ?.output
                            ?.statusCode;

                    console.log(
                        `קוד: ${statusCode}`
                    );

                    sock =
                        null;

                    // ========================================
                    // Logged out
                    // ========================================

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

                    // ========================================
                    // Reconnect
                    // ========================================

                    if (reconnectTimer) {

                        clearTimeout(
                            reconnectTimer
                        );
                    }

                    const delay =
                        statusCode ===
                        DisconnectReason.restartRequired
                            ? 1000
                            : 5000;

                    console.log(
                        `מנסה להתחבר מחדש בעוד ${delay / 1000} שניות...`
                    );

                    reconnectTimer =
                        setTimeout(
                            () => {

                                reconnectTimer =
                                    null;

                                startWhatsApp();

                            },
                            delay
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
                type,
                requestId
            }) => {

                try {

                    // ========================================
                    // Ignore requestId events
                    // ========================================

                    if (requestId) {

                        console.log(
                            "התעלמות מאירוע messages.upsert עם requestId."
                        );

                        return;
                    }

                    if (
                        !messages ||
                        messages.length === 0
                    ) {
                        return;
                    }

                    // ========================================
                    // Process every message
                    // ========================================

                    for (
                        const message
                        of messages
                    ) {

                        if (
                            !message?.message
                        ) {
                            continue;
                        }

                        const messageId =
                            message.key?.id;

                        // ========================================
                        // Ignore messages sent by the bot itself
                        // ========================================

                        if (
                            messageId &&
                            botSentMessageIds.has(
                                messageId
                            )
                        ) {

                            botSentMessageIds.delete(
                                messageId
                            );

                            continue;
                        }

                        const remoteJid =
                            message.key
                                ?.remoteJid;

                        if (!remoteJid) {
                            continue;
                        }

                        // ========================================
                        // ONLY TARGET GROUP
                        // ========================================

                        if (
                            remoteJid !==
                            TARGET_GROUP_JID
                        ) {

                            continue;
                        }

                        // ========================================
                        // Extract text
                        // ========================================

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

                        console.log(
                            "========================================"
                        );

                        console.log(
                            `הודעה התקבלה בקבוצת היעד (${type})`
                        );

                        console.log(
                            `fromMe: ${message.key?.fromMe}`
                        );

                        console.log(
                            `text: ${text}`
                        );

                        console.log(
                            "========================================"
                        );

                        // ========================================
                        // Rider test
                        // ========================================

                        if (
                            text
                                .toLowerCase()
                                .includes(
                                    "rider"
                                )
                        ) {

                            if (!sock) {
                                continue;
                            }

                            const sent =
                                await sock.sendMessage(
                                    TARGET_GROUP_JID,
                                    {
                                        text:
                                            "📱 Rider זוהה! 🚀"
                                    }
                                );

                            // ========================================
                            // Save sent message ID
                            // Prevent bot response loop
                            // ========================================

                            if (
                                sent?.key?.id
                            ) {

                                botSentMessageIds.add(
                                    sent.key.id
                                );

                                // Keep memory clean
                                setTimeout(
                                    () => {
                                        botSentMessageIds.delete(
                                            sent.key.id
                                        );
                                    },
                                    60000
                                );
                            }

                            console.log(
                                "תגובה נשלחה לקבוצת היעד ✅"
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

        starting =
            false;

        sock =
            null;

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
        async (
            req,
            res
        ) => {

            // ========================================
            // Home
            // ========================================

            if (
                req.url === "/"
            ) {

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
                            קבוצה:
                            <strong>
                                ${TARGET_GROUP_NAME}
                            </strong>
                        </p>

                        <p>
                            JID:
                            <strong>
                                ${TARGET_GROUP_JID}
                            </strong>
                        </p>

                        <p>
                            <a href="/qr">
                                פתיחת QR
                            </a>
                        </p>

                        <p>
                            <a href="/health">
                                Health
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

            if (
                req.url === "/qr"
            ) {

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
                                אין QR פעיל כרגע.
                            </p>

                            <p>
                                הדף יבדוק שוב בעוד 3 שניות.
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
                            לאחר הסריקה אפשר לרענן.
                        </p>

                    </body>

                    </html>
                `);

                return;
            }

            // ========================================
            // Health
            // ========================================

            if (
                req.url === "/health"
            ) {

                res.writeHead(
                    200,
                    {
                        "Content-Type":
                            "application/json; charset=utf-8"
                    }
                );

                res.end(
                    JSON.stringify(
                        {
                            status:
                                currentStatus,

                            whatsapp:
                                Boolean(sock),

                            targetGroup:
                                TARGET_GROUP_NAME,

                            targetGroupJid:
                                TARGET_GROUP_JID,

                            connected:
                                Boolean(
                                    sock &&
                                    currentStatus
                                        .includes(
                                            "מחובר"
                                        )
                                )
                        }
                    )
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
