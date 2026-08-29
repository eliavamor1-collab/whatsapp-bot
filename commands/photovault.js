let savedMessage = null;

export default {
  trigger: "photo vault",
  aliases: ["photovault", "כספת תמונות"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Photo Vault PRIVARY*
🔢 *גירסא:* v3.3.3
📦 *גודל:* ~20 MB
💾 *סוג:* אבטחה ופרטיות
🎯 *תוכן:*
כספת לתמונות וסרטונים — נועלים עם סיסמה או טביעת אצבע. אף אחד לא יכול לגשת לתוכן שלכם בלי אישור.

ℹ️ *הערות:*
פרימיום פרוץ — כל הפיצ'רים פתוחים`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת photovault הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Photo Vault PRIVARY*
🔢 *גירסא:* v3.3.3
📦 *גודל:* ~20 MB
💾 *סוג:* אבטחה ופרטיות
🎯 *תוכן:*
כספת לתמונות וסרטונים — נועלים עם סיסמה או טביעת אצבע. אף אחד לא יכול לגשת לתוכן שלכם בלי אישור.

ℹ️ *הערות:*
פרימיום פרוץ — כל הפיצ'רים פתוחים

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/photo-vault-privary.html
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/X3HPr4G9fwwDHWW_XU1nXCrMDWnP1GyU_HxJDj2W0K0eSttf5T6kDZ5qECGVlbIc8eg" },
            caption: captionText
          },
          { quoted: message }
        );
        if (sentMsg) savedMessage = sentMsg;
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת photovault:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
