let savedMessage = null;

export default {
  trigger: "alight motion",
  aliases: ["אליית מושן", "אלייט מושן"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת alight motion הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Alight Motion*
🔢 *גירסא:* v5.0.279
📦 *גודל:* 101 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
אפליקציית עריכת וידאו מקצועית עם אנימציה, אפקטים ויזואליים, גרפיקה בתנועה — הכל פתוח ללא תשלום.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

📲 *קישור להורדה:*
https://liteapks.com/alight-motion.html`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Alight Motion...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Alight Motion בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/alight-motion-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Alight Motion הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת alight motion:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
