export default {
    trigger: "/start",

    async execute(sock, message) {

        await sock.sendMessage(
            message.key.remoteJid,
            {
                text: "👋 שלום! הבוט עובד ✅"
            }
        );

    }
};
