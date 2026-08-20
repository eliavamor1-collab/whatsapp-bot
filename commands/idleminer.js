let savedMessage = null;

export default {
  trigger: "idle miner",
  aliases: ["idle miner tycoon", "איידל מיינר", "מכרה"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Idle Miner Tycoon*
🔢 *גירסא:* v5.61.1
📦 *גודל:* 230.2 MB
💾 *סוג:* משחק
🎯 *תוכן:*
בנה אימפריית כרייה ענקית! שכור עובדים, שדרג מכרות ואסוף כסף גם כשאתה לא במשחק. ככל שתשקיע יותר, ככה הכסף והדולרים ישתכפלו וגדלו.

ℹ️ *הערות:*
בהתחלה תתחילו באמת בלי שום כסף ודולרים, אבל ככל שתקבלו יותר כסף ודולרים ככה הם ילכו וישתכפלו`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת idle miner הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Idle Miner Tycoon*
🔢 *גירסא:* v5.61.1
📦 *גודל:* 230.2 MB
💾 *סוג:* משחק
🎯 *תוכן:*
בנה אימפריית כרייה ענקית! שכור עובדים, שדרג מכרות ואסוף כסף גם כשאתה לא במשחק. ככל שתשקיע יותר, ככה הכסף והדולרים ישתכפלו וגדלו.

ℹ️ *הערות:*
בהתחלה תתחילו באמת בלי שום כסף ודולרים, אבל ככל שתקבלו יותר כסף ודולרים ככה הם ילכו וישתכפלו

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://an1.com/file_4468-dw.html
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Idle Miner...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Idle Miner בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://an1.com/uploads/posts/2025-11/1763023257_idle-miner-tycoon.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Idle Miner הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת idle miner:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
