let savedMessage = null;

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

    const captionText =
`📱 *שם האפליקציה:*
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

    try {
      if (savedMessage) {
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/VuVNi_bHCxQR-2hXr3g_TZON-S3Y2Wx4USzVKAU5R0qVaQw9J0CbQ3a0GqilXm4qjA" },
            caption: captionText
          },
          { quoted: message }
        );
        if (sentMsg) savedMessage = sentMsg;
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת fnf:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
