let savedMessage = null;

export default {
  trigger: "fl studio",
  aliases: ["אפאל סטודיו", "פלאל סטודיו", "fl studio mobile", "אפאל", "פלאל"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת fl studio הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*FL Studio Mobile*
🔢 *גירסא:* v4.10.19
📦 *גודל:* 236 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
סטודיו ייצור מוזיקה מקצועי לנייד — צור ביטים, ערוך מסלולים והפק מוזיקה ברמה גבוהה מכל מקום.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/fl-studio-mobile-6151/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת FL Studio...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת FL Studio בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/05/fl-studio-mobile-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת FL Studio הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת fl studio:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
