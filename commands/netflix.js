let savedMessage = null;

export default {
  trigger: "netflix",
  aliases: ["נטפליקס"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Netflix*
🔢 *גירסא:* v9.78.0
📦 *גודל:* 21 MB
💾 *סוג:* סטרימינג סרטים
🎯 *תוכן:*
פלטפורמת הסטרימינג הגדולה בעולם — סרטים, סדרות ותכנים מקוריים באיכות 4K HDR, פתוחים לגמרי.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת netflix הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Netflix*
🔢 *גירסא:* v9.78.0
📦 *גודל:* 21 MB
💾 *סוג:* סטרימינג סרטים
🎯 *תוכן:*
פלטפורמת הסטרימינג הגדולה בעולם — סרטים, סדרות ותכנים מקוריים באיכות 4K HDR, פתוחים לגמרי.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/netflix-72/1

📲 *להורדת התוסף:*
https://liteapks.com/download/netflix-72/2
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Netflix...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Netflix בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/netflix-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Netflix הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת netflix:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
