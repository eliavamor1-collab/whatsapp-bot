import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "friday night funkin",
  aliases: ["fnf", "פריידי נייט פאנקין"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Friday Night Funkin'*
🔢 *גירסא:* v0.8.7
📦 *גודל:* ~100 MB
💾 *סוג:* משחק ריתם/מוזיקה
🎯 *תוכן:*
משחק ריתם מכור — לוחצים על החצים בקצב המוזיקה ומנצחים יריבים. סטייל רטרו עם מוזיקה ממכרת.

ℹ️ *הערות:*
גרסה מלאה פרוצה`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת fnf הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Friday Night Funkin'*
🔢 *גירסא:* v0.8.7
📦 *גודל:* ~100 MB
💾 *סוג:* משחק ריתם/מוזיקה
🎯 *תוכן:*
משחק ריתם מכור — לוחצים על החצים בקצב המוזיקה ומנצחים יריבים. סטייל רטרו עם מוזיקה ממכרת.

ℹ️ *הערות:*
גרסה מלאה פרוצה

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/friday-night-funkin.html
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://play-lh.googleusercontent.com/VuVNi_bHCxQR-2hXr3g_TZON-S3Y2Wx4USzVKAU5R0qVaQw9J0CbQ3a0GqilXm4qjA" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת fnf:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
