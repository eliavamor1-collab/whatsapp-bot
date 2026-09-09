import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "crunchyroll",
  aliases: ["קראנצ'ירול", "קראנצירול", "אנימה"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Crunchyroll*
🔢 *גירסא:* v3.115.0
📦 *גודל:* ~50 MB
💾 *סוג:* סטרימינג אנימה
🎯 *תוכן:*
פלטפורמת האנימה הכי גדולה בעולם — יותר מ-1,300 סדרות וסרטים ביפנית עם כתוביות. פרימיום פרוץ, בלי פרסומות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת crunchyroll הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Crunchyroll*
🔢 *גירסא:* v3.115.0
📦 *גודל:* ~50 MB
💾 *סוג:* סטרימינג אנימה
🎯 *תוכן:*
פלטפורמת האנימה הכי גדולה בעולם — יותר מ-1,300 סדרות וסרטים ביפנית עם כתוביות. פרימיום פרוץ, בלי פרסומות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/crunchyroll-2.html
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://play-lh.googleusercontent.com/a-0bCAGf3ss5S5-MQ0WEkQWRFPU__LGJvDqAGlIjFkLcCbFJCz7I9Qk7gyq6NF0Qb0" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת crunchyroll:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
