import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "disney",
  aliases: ["דיסני", "disney+", "דיסני פלוס"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Disney+*
🔢 *גירסא:* v26.7.0
📦 *גודל:* 50 MB
💾 *סוג:* סטרימינג סרטים
🎯 *תוכן:*
כל הקסם של Disney, Pixar, Marvel ו-Star Wars במקום אחד — פרימיום פתוח לכל האזורים.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת disney הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Disney+*
🔢 *גירסא:* v26.7.0
📦 *גודל:* 50 MB
💾 *סוג:* סטרימינג סרטים
🎯 *תוכן:*
כל הקסם של Disney, Pixar, Marvel ו-Star Wars במקום אחד — פרימיום פתוח לכל האזורים.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/disney-196/1

📲 *להורדת התוסף:*
https://liteapks.com/download/disney-196/2
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/disney-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת disney:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
