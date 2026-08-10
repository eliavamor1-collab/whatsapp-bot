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

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("סרוק את ה-QR הבא עם WhatsApp:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("WhatsApp מחובר! ✅");
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;

            console.log("WhatsApp התנתק.");

            if (shouldReconnect) {
                console.log("מנסה להתחבר מחדש...");
                startWhatsApp();
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const message = messages[0];

        if (!message.message) return;
        if (message.key.fromMe) return;

        const text =
            message.message.conversation ||
            message.message.extendedTextMessage?.text ||
            "";

        console.log("התקבלה הודעה:", text);

        if (text.toLowerCase().includes("rider")) {
            await sock.sendMessage(message.key.remoteJid, {
                text: "📱 Rider זוהה! 🚀"
            });
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
