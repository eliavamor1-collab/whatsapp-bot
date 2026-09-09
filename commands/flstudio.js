import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "fl studio",
  aliases: ["אפאל סטודיו"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת fl studio הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*FL Studio Mobile*
🔢 *גירסא:* v4.10.19
📦 *גודל:* 236 MB
💾 *סוג:* ייצור מוזיקה
🎯 *תוכן:*
סטודיו ייצור מוזיקה מקצועי לנייד — צור ביטים, ערוך מסלולים והפק מוזיקה ברמה גבוהה מכל מקום.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/fl-studio-mobile-6151/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/05/fl-studio-mobile-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת fl studio:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
