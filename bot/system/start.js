export default {
  trigger: "/start",

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת /start הופעלה!");

    try {
      await sock.sendMessage(
        jid,
        { text: "👋 שלום! הבוט עובד ✅" },
        { quoted: message }
      );
      console.log("✅ הודעת start נשלחה בהצלחה!");
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת start:", error);
    }
  }
};
