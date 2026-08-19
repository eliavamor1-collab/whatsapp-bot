let savedMessage = null;

export default {
  trigger: "twitter",
  aliases: ["טוויטר", "איקס"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת twitter הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*X (Twitter)*
🔢 *גירסא:* v12.14.0
📦 *גודל:* 85 MB
💾 *סוג:* רשת חברתית
🎯 *תוכן:*
טוויטר/X ללא פרסומות עם פיצ'רים פרימיום — הורדת סרטונים, הסרת מעקב, מצב קריאה, ועוד.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/twitter-78804/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Twitter...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Twitter בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2024/03/twitter-150x150.webp" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Twitter הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת twitter:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
