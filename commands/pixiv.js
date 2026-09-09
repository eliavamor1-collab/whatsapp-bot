import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "pixiv",
  aliases: ["פיקסיב"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת pixiv הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*pixiv*
🔢 *גירסא:* v6.193.0
📦 *גודל:* 40 MB
💾 *סוג:* אמנות ואיור
🎯 *תוכן:*
פלטפורמה חברתית לאמנים — צפה, שתף וגלה מיליוני יצירות אמנות, איורים וקומיקס מאמנים מכל העולם.

ℹ️ *הערות:*
Premium Unlocked

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/pixiv-32145/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/09/pixiv-150x150.jpg" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת pixiv:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
