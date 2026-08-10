import http from "http";
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState
} from "baileys";
import QRCode from "qrcode";

const PORT = process.env.PORT || 10000;

let currentQR = null;
let whatsappConnected = false;
let starting = false;

async function startWhatsApp() {
    if (starting) return;
    starting = true;

    try {
        const { state, saveCreds } =
            await useMultiFileAuthState("./auth_info");

        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false
        });

        sock.ev.on("creds.update", saveCreds);

        sock.ev.on("connection.update", async (update) => {
            const {
                connection,
                lastDisconnect,
                qr
            } = update;

            // קיבלנו QR חדש
            if (qr) {
                try {
                    currentQR = await QRCode.toDataURL(qr, {
                        width: 400,
                        margin: 2
                    });

                    console.log("QR חדש מוכן בכתובת /qr");
                } catch (error) {
                    console.error(
                        "שגיאה ביצירת QR:",
                        error
                    );
                }
            }

            // התחברות הצליחה
            if (connection === "open") {
                whatsappConnected = true;
                currentQR = null;
                starting = false;

                console.log("WhatsApp מחובר! ✅");
            }

            // החיבור נסגר
            if (connection === "close") {
                whatsappConnected = false;

                const statusCode =
                    lastDisconnect?.error?.output?.statusCode;

                console.log(
                    "WhatsApp התנתק. קוד:",
                    statusCode
                );

                starting = false;

                if (
                    statusCode !==
                    DisconnectReason.loggedOut
                ) {
                    console.log(
                        "מנסה להתחבר מחדש..."
                    );

                    setTimeout(() => {
                        startWhatsApp();
                    }, 3000);
                } else {
                    console.log(
                        "החשבון נותק. צריך לחבר אותו מחדש."
                    );
                }
            }
        });

        // קבלת הודעות
        sock.ev.on(
            "messages.upsert",
            async ({ messages }) => {

                for (const message of messages) {

                    if (!message.message) continue;
                    if (message.key.fromMe) continue;

                    const text =
                        message.message.conversation ||
                        message.message.extendedTextMessage?.text ||
                        "";

                    if (!text) continue;

                    console.log(
                        "התקבלה הודעה:",
                        text
                    );

                    // Rider
                    if (
                        text
                            .toLowerCase()
                            .includes("rider")
                    ) {
                        try {
                            await sock.sendMessage(
                                message.key.remoteJid,
                                {
                                    text:
                                        "📱 Rider זוהה! 🚀"
                                }
                            );

                            console.log(
                                "נשלחה תגובת Rider ✅"
                            );

                        } catch (error) {
                            console.error(
                                "שגיאה בשליחת תגובה:",
                                error
                            );
                        }
                    }
                }
            }
        );

    } catch (error) {
        starting = false;

        console.error(
            "שגיאה בהפעלת WhatsApp:",
            error
        );

        setTimeout(() => {
            startWhatsApp();
        }, 5000);
    }
}


// --------------------------------
// שרת HTTP של Render
// --------------------------------

const server = http.createServer(
    (req, res) => {

        // דף הבית
        if (req.url === "/") {
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8"
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
                        ${
                            whatsappConnected
                                ? "🟢 מחובר"
                                : "🟡 ממתין לחיבור"
                        }
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


        // QR
        if (req.url === "/qr") {

            if (whatsappConnected) {
                res.writeHead(200, {
                    "Content-Type":
                        "text/html; charset=utf-8"
                });

                res.end(`
                    <!DOCTYPE html>
                    <html lang="he">
                    <head>
                        <meta charset="UTF-8">
                        <title>WhatsApp מחובר</title>
                    </head>
                    <body>
                        <h1>🟢 WhatsApp כבר מחובר!</h1>
                    </body>
                    </html>
                `);

                return;
            }


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
                        <h1>⏳ מחכה ל-QR...</h1>
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
                        content="width=device-width,
                        initial-scale=1.0"
                    >

                    <title>WhatsApp QR</title>
                </head>

                <body
                    style="
                        text-align:center;
                        font-family:Arial;
                    "
                >

                    <h1>
                        📱 חבר את WhatsApp
                    </h1>

                    <p>
                        WhatsApp → מכשירים מקושרים
                        → קישור מכשיר
                    </p>

                    <img
                        src="${currentQR}"
                        alt="WhatsApp QR"
                        style="
                            width:400px;
                            max-width:90vw;
                        "
                    >

                    <p>
                        סרוק את הקוד עם הטלפון.
                    </p>

                </body>
                </html>
            `);

            return;
        }


        res.writeHead(404);
        res.end("Not found");
    }
);


server.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `Server is running on port ${PORT}`
        );
    }
);


// הפעלת WhatsApp
startWhatsApp();
