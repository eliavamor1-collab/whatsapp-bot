let savedMessage = null;

export default {
  trigger: "busuu",
  aliases: ["בוסו", "בוסוו"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Busuu*
🔢 *גירסא:* v32.44.0
📦 *גודל:* ~45 MB
💾 *סוג:* לימוד שפות
🎯 *תוכן:*
לימוד שפות ברמה אחרת — שיחות עם אנשים אמיתיים, תרגילים אינטראקטיביים, ותוכנית אישית. יותר מ-14 שפות.

ℹ️ *הערות:*
פרימיום פרוץ — כל הקורסים פתוחים`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת busuu הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Busuu*
🔢 *גירסא:* v32.44.0
📦 *גודל:* ~45 MB
💾 *סוג:* לימוד שפות
🎯 *תוכן:*
לימוד שפות ברמה אחרת — שיחות עם אנשים אמיתיים, תרגילים אינטראקטיביים, ותוכנית אישית. יותר מ-14 שפות.

ℹ️ *הערות:*
פרימיום פרוץ — כל הקורסים פתוחים

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/busuu-learn-languages.html
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/IDWO_bMLJm2n4GS-GS-TQ5jiMJUhfUHN4K4Q1v9Rp6b5InaGePT2Y5W6VEwVBZpCKw" },
            caption: captionText
          },
          { quoted: message }
        );
        if (sentMsg) savedMessage = sentMsg;
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת busuu:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
