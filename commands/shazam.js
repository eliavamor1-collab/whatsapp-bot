import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "shazam",
  aliases: ["שאזם", "שזאם"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Shazam*
🔢 *גירסא:* v16.54.1
📦 *גודל:* ~30 MB
💾 *סוג:* מוזיקה וזיהוי שירים
🎯 *תוכן:*
שומעים שיר ולא יודעים מה השם? Shazam מזהה כל שיר תוך שניות. פשוט מפעילים ומקבלים שם + אמן + קישור להאזנה.

ℹ️ *הערות:*
פרימיום פרוץ — בלי פרסומות`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת shazam הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Shazam*
🔢 *גירסא:* v16.54.1
📦 *גודל:* ~30 MB
💾 *סוג:* מוזיקה וזיהוי שירים
🎯 *תוכן:*
שומעים שיר ולא יודעים מה השם? Shazam מזהה כל שיר תוך שניות. פשוט מפעילים ומקבלים שם + אמן + קישור להאזנה.

ℹ️ *הערות:*
פרימיום פרוץ — בלי פרסומות

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/shazam.html
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://play-lh.googleusercontent.com/bfRcQY-gHEfhBp1-R3e6MnDMCmONnhcNDEs7JmmFQfjTXMVA0kxLQuCnTPxQv-ZNJlU" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת shazam:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
