let savedMessage = null;

export default {
  trigger: "subway",
  aliases: ["סאבווי"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת subway הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Subway Surfers*
🔢 *גירסא:* v3.67.1
📦 *גודל:* 229.8 MB
💾 *סוג:* משחק
🎯 *תוכן:*
רצו, התחמקו מרכבות ועזרו ל-Jake והחבורה לברוח מהמפקח והכלב שלו במשחק הריצה המפורסם בעולם!

ℹ️ *הערות:*
פשוט להתקין ולשחק

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/subway-surfers-14695/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Subway Surfers...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Subway Surfers בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2025/08/download-6-150x150.jpg" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Subway Surfers הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת subway:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
