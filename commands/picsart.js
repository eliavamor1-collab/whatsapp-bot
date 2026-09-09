let savedMessage = null;

export default {
  trigger: "picsart",
  aliases: ["פיקסארט", "pics art"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת picsart הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Picsart Gold*
🔢 *גירסא:* v30.5.1
📦 *גודל:* לא צוין
💾 *סוג:* עריכת תמונות
🎯 *תוכן:*
עורך תמונות מקצועי עם פילטרים, הסרת רקע, אפקטי AI, קולאז' ועוד — כל הפיצ'רים פרימיום פתוחים.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/picsart-studio-136/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Picsart...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Picsart בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/picsart-photo-video-editor-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Picsart הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת picsart:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
