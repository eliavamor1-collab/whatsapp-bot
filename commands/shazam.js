let savedMessage = null;

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

    const captionText =
`📱 *שם האפליקציה:*
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

    try {
      if (savedMessage) {
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/bfRcQY-gHEfhBp1-R3e6MnDMCmONnhcNDEs7JmmFQfjTXMVA0kxLQuCnTPxQv-ZNJlU" },
            caption: captionText
          },
          { quoted: message }
        );
        if (sentMsg) savedMessage = sentMsg;
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת shazam:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
