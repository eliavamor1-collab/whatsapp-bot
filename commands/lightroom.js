let savedMessage = null;

export default {
  trigger: "lightroom",
  aliases: ["לייטרום", "adobe lightroom"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת lightroom הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Lightroom*
🔢 *גירסא:* v11.5.01
📦 *גודל:* 117 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
עורך תמונות מקצועי של Adobe — שלוט על הצבעים, האור והסגנון של כל תמונה ברמת פרו.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/adobe-lightroom-205/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Lightroom...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Lightroom בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/lightroom-photo-editor-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Lightroom הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת lightroom:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
