let savedMessage = null;

export default {
  trigger: "instagram",
  aliases: ["אינסטגרם", "אינסטה", "insta"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת instagram הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Instagram*
🔢 *גירסא:* v442.0.0.46.79
📦 *גודל:* 54 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
אינסטגרם ללא פרסומות עם פיצ'רים מיוחדים — הורדת תמונות וסרטונים, הסתרת סטטוס פעילות, ערכות נושא, ועוד.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://drive.google.com/file/d/1j50X-jUqXT_65fC2WJWcnEYig0nq_Tbx/view?usp=sharing
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Instagram...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Instagram בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/instagram-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Instagram הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת instagram:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
