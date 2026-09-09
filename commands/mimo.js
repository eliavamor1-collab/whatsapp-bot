import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "mimo",
  aliases: ["מימו", "לימוד קוד", "לימוד תכנות"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Mimo — Learn Coding*
🔢 *גירסא:* v9.26
📦 *גודל:* ~60 MB
💾 *סוג:* לימוד תכנות
🎯 *תוכן:*
לומדים תכנות בצורה אינטראקטיבית — Python, JavaScript, HTML ועוד. שיעורים קצרים, אתגרים יומיים, ומסלולים מלאים.

ℹ️ *הערות:*
פרימיום פרוץ — כל המסלולים פתוחים`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת mimo הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Mimo — Learn Coding*
🔢 *גירסא:* v9.26
📦 *גודל:* ~60 MB
💾 *סוג:* לימוד תכנות
🎯 *תוכן:*
לומדים תכנות בצורה אינטראקטיבית — Python, JavaScript, HTML ועוד. שיעורים קצרים, אתגרים יומיים, ומסלולים מלאים.

ℹ️ *הערות:*
פרימיום פרוץ — כל המסלולים פתוחים

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/mimo-learn-coding.html
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://play-lh.googleusercontent.com/mhVz5SQ_jSjEY84MJQ9S7P1DdLq0vlkw05q5JmqXb0cmq0oUlWHAPyC1VhHwNBDqLQ" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת mimo:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
