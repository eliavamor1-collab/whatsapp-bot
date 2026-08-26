let savedMessage = null;

export default {
  trigger: "oldroll",
  aliases: ["אולדרול", "מצלמה וינטג'", "מצלמה וינטג"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*OldRoll — Vintage Film Camera*
🔢 *גירסא:* v6.6.1
📦 *גודל:* ~45 MB
💾 *סוג:* צילום
🎯 *תוכן:*
מצלמה עם אפקטי פילם וינטג' — כאילו מצלמים במצלמה חד-פעמית מהתקופה. תמונות עם סטייל של שנות ה-90.

ℹ️ *הערות:*
פרימיום פרוץ — כל הפילטרים פתוחים`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת oldroll הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*OldRoll — Vintage Film Camera*
🔢 *גירסא:* v6.6.1
📦 *גודל:* ~45 MB
💾 *סוג:* צילום
🎯 *תוכן:*
מצלמה עם אפקטי פילם וינטג' — כאילו מצלמים במצלמה חד-פעמית מהתקופה. תמונות עם סטייל של שנות ה-90.

ℹ️ *הערות:*
פרימיום פרוץ — כל הפילטרים פתוחים

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/oldroll.html
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/9POgifiA-t_PxlPfHMHKGYcJrHvSPz9OCAaPlCuIUQkBc_S_OVnLbRfLSuS9VwL7Rg" },
            caption: captionText
          },
          { quoted: message }
        );
        if (sentMsg) savedMessage = sentMsg;
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת oldroll:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
