import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "subway",
  aliases: ["סאבווי"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Subway Surfers*
🔢 *גירסא:* v3.67.1
📦 *גודל:* 229.8 MB
💾 *סוג:* משחק
🎯 *תוכן:*
רצו, התחמקו מרכבות ועזרו ל-Jake והחבורה לברוח מהמפקח והכלב שלו במשחק הריצה המפורסם בעולם!

ℹ️ *הערות:*
פשוט להתקין ולשחק`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת subway הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Subway Surfers*
🔢 *גירסא:* v3.67.1
📦 *גודל:* 229.8 MB
💾 *סוג:* משחק
🎯 *תוכן:*
רצו, התחמקו מרכבות ועזרו ל-Jake והחבורה לברוח מהמפקח והכלב שלו במשחק הריצה המפורסם בעולם!

ℹ️ *הערות:*
פשוט להתקין ולשחק

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/subway-surfers-14695/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2025/08/download-6-150x150.jpg" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת subway:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
