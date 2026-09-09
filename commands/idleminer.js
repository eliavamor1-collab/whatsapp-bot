import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "idle miner",
  aliases: ["idle miner tycoon", "איידל מיינר"],

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

    let captionText = `📱 *שם האפליקציה:*
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

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://an1.com/uploads/posts/2025-11/1763023257_idle-miner-tycoon.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת idle miner:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
