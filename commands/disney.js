let savedMessage = null;

export default {
  trigger: "disney",
  aliases: ["דיסני", "disney+", "דיסני פלוס"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת disney הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Disney+*
🔢 *גירסא:* v26.7.0
📦 *גודל:* 50 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
כל הקסם של Disney, Pixar, Marvel ו-Star Wars במקום אחד — פרימיום פתוח לכל האזורים.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/disney-196/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Disney+...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Disney+ בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/disney-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Disney+ הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת disney:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
