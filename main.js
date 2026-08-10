import http from "http";
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState
} from "baileys";
import qrcode from "qrcode-terminal";

const PORT = process.env.PORT || 10000;

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("סרוק את ה-QR הבא עם WhatsApp:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("WhatsApp מחובר! ✅");
        }

        if (connection === "close") {
            const statusCode =
                lastDisconnect?.error?.output?.statusCode;

            const shouldReconnect =
                statusCode !== DisconnectReason.loggedOut;

            console.log("WhatsApp התנתק.");

            if (shouldReconnect) {
                console.log("מנסה להתחבר מחדש...");
                await startWhatsApp();
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        for (const message of messages) {
            if (!message.message) continue;
            if (message.key.fromMe) continue;

            const text =
                message.message.conversation ||
                message.message.extendedTextMessage?.text ||
                "";

            console.log("התקבלה הודעה:", text);

            if (text.toLowerCase().includes("rider")) {
                try {
                    await sock.sendMessage(
                        message.key.remoteJid,
                        {
                            text: "📱 Rider זוהה! 🚀"
                        }
                    );

                    console.log("נשלחה תגובה ל-Rider ✅");
                } catch (error) {
                    console.error(
                        "שגיאה בשליחת התגובה:",
                        error
                    );
                }
            }
        }
    });
}

startWhatsApp();

const server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, {
            "Content-Type": "text/plain"
        });

        res.end("WhatsApp bot is alive!");
        return;
    }

    res.writeHead(404);
    res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});
