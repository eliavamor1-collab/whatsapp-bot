let savedMessage = null;

export default {
  trigger: "poweramp",
  aliases: ["פאווראמפ", "פאוור אמפ"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת poweramp הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Poweramp Music Player*
🔢 *גירסא:* v1023
📦 *גודל:* 22 MB
💾 *סוג:* נגן מוזיקה
🎯 *תוכן:*
נגן המוזיקה המתקדם ביותר לאנדרואיד — אקולייזר מקצועי, תמיכה בכל פורמט אודיו וספריית מוזיקה ענקית.

ℹ️ *הערות:*
Premium Unlocked (הגרסה המלאה פתוחה)

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/download/poweramp-music-player-246512/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Poweramp...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Poweramp בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://9mod.com/wp-content/uploads/2025/11/poweramp-music-player-150x150.webp" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Poweramp הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת poweramp:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
