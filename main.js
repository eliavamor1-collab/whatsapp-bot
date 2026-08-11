import http from "http";

import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestWaWebVersion,
    Browsers
} from "baileys";

import QRCode from "qrcode";

const PORT = process.env.PORT || 10000;

let currentQR = null;
let currentStatus = "מתחבר...";
let sock = null;
let reconnecting = false;


async function startWhatsApp() {
    if (reconnecting) return;

    reconnecting = true;

    try {
        const { state, saveCreds } =
            await useMultiFileAuthState("./auth_info");

        console.log("בודק גרסת WhatsApp Web...");

        const { version, isLatest } =
            await fetchLatestWaWebVersion();

        console.log(
            `WhatsApp Web Version: ${version.join(".")} | Latest: ${isLatest}`
        );

        sock = makeWASocket({
            auth: state,
            version,
            browser: Browsers.ubuntu("Chrome"),
            printQRInTerminal: false
        });

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", async (update) => {
            const {
                connection,
                lastDisconnect,
                qr
            } = update;

          if (qr) {
            try {
                currentQR = await QRCode.toDataURL(qr);
                currentStatus = "ממתין לסריקת QR";

                console.log("QR חדש מוכן בכתובת /qr");
            } catch (error) {
                console.error(
                    "שגיאה ביצירת QR:",
                    error
                );
            }
        }

        if (connection === "connecting") {
            currentStatus = "מתחבר...";
            console.log("מתחבר ל-WhatsApp...");
        }

        if (connection === "open") {
            currentQR = null;
            currentStatus = "מחובר ✅";

            console.log("WhatsApp מחובר! ✅");

            // מציאת הקבוצות שהחשבון משתתף בהן
            try {
                const groups =
                    await sock.groupFetchAllParticipating();

                console.log("===== הקבוצות שלי =====");

                for (const group of Object.values(groups)) {
                    console.log(
                        `שם: ${group.subject} | JID: ${group.id}`
                    );
                }

                console.log("========================");
            } catch (error) {
                console.error(
                    "שגיאה בקבלת רשימת הקבוצות:",
                    error
                );
            }

            reconnecting = false;
        }
                currentStatus = "מחובר ✅";

                console.log("WhatsApp מחובר! ✅");

                reconnecting = false;
            }

            if (connection === "close") {
                currentStatus = "מנותק";

                const statusCode =
                    lastDisconnect?.error?.output?.statusCode;

                console.log(
                    `WhatsApp התנתק. קוד: ${statusCode}`
                );

                reconnecting = false;

                if (
                    statusCode !== DisconnectReason.loggedOut
                ) {
                    console.log(
                        "מנסה להתחבר מחדש בעוד 5 שניות..."
                    );

                    setTimeout(() => {
                        startWhatsApp();
                    }, 5000);
                } else {
                    currentStatus =
                        "התנתק לצמיתות — יש לחבר מחדש";
                }
            }
        });

        sock.ev.on(
            "messages.upsert",
            async ({ messages }) => {
                const message = messages[0];

                if (!message?.message) return;
                if (message.key?.fromMe) return;

                const text =
                    message.message.conversation ||
                    message.message.extendedTextMessage?.text ||
                    "";

                if (!text) return;

                console.log(
                    "התקבלה הודעה:",
                    text
                );

                if (
                    text
                        .toLowerCase()
                        .includes("rider")
                ) {
                    await sock.sendMessage(
                        message.key.remoteJid,
                        {
                            text: "📱 Rider זוהה! 🚀"
                        }
                    );
                }
            }
        );

    } catch (error) {
        reconnecting = false;

        console.error(
            "שגיאה בהפעלת WhatsApp:",
            error
        );

        currentStatus = "שגיאה בחיבור";

        setTimeout(() => {
            startWhatsApp();
        }, 10000);
    }
}


/*
    שרת HTTP של Render
*/

const server = http.createServer(
    async (req, res) => {

        /*
            דף הבית
        */

        if (req.url === "/") {
            res.writeHead(200, {
                "Content-Type":
                    "text/html; charset=utf-8"
            });

            res.end(`
                <!DOCTYPE html>
                <html lang="he">
                <head>
                    <meta charset="UTF-8">
                    <title>WhatsApp Bot</title>
                </head>

                <body>
                    <h1>WhatsApp Bot 🤖</h1>

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


        /*
            QR
        */

        if (req.url === "/qr") {

            if (!currentQR) {
                res.writeHead(200, {
                    "Content-Type":
                        "text/html; charset=utf-8"
                });

                res.end(`
                    <!DOCTYPE html>
                    <html lang="he">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="refresh" content="3">
                        <title>WhatsApp QR</title>
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

            res.writeHead(200, {
                "Content-Type":
                    "text/html; charset=utf-8"
            });

            res.end(`
                <!DOCTYPE html>
                <html lang="he">
                <head>
                    <meta charset="UTF-8">
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1"
                    >

                    <title>WhatsApp QR</title>

                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 30px;
                        }

                        img {
                            width: 300px;
                            max-width: 90%;
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
                        לאחר הסריקה אפשר לרענן את הדף.
                    </p>

                </body>
                </html>
            `);

            return;
        }


        /*
            נתיב לא קיים
        */

        res.writeHead(404, {
            "Content-Type":
                "text/plain; charset=utf-8"
        });

        res.end("Not found");
    }
);


/*
    הפעלת השרת
*/

server.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `Server is running on port ${PORT}`
        );
    }
);


/*
    הפעלת WhatsApp
*/

startWhatsApp();
