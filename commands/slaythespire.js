let savedMessage = null;

export default {
  trigger: "slay the spire",
  aliases: ["slaythespire", "סליי דה ספייר"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Slay the Spire 2*
🔢 *גירסא:* v0.111.0
📦 *גודל:* ~500 MB
💾 *סוג:* משחק קלפים אסטרטגי
🎯 *תוכן:*
משחק קלפים אסטרטגי ממכר — בונים חפיסה, עולים קומות, ונלחמים בבוסים. כל משחק שונה. המשחק שכולם מדברים עליו.

ℹ️ *הערות:*
גרסה מלאה פרוצה`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת slaythespire הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Slay the Spire 2*
🔢 *גירסא:* v0.111.0
📦 *גודל:* ~500 MB
💾 *סוג:* משחק קלפים אסטרטגי
🎯 *תוכן:*
משחק קלפים אסטרטגי ממכר — בונים חפיסה, עולים קומות, ונלחמים בבוסים. כל משחק שונה. המשחק שכולם מדברים עליו.

ℹ️ *הערות:*
גרסה מלאה פרוצה

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/slay-the-spire.html
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/GLZW1d40yfCgQ5V0m7i0HbsNp_0PBUOrVCYKJH1P8JJpqc7L67AWh3VNB4FpWjgvNQ" },
            caption: captionText
          },
          { quoted: message }
        );
        if (sentMsg) savedMessage = sentMsg;
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת slaythespire:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
