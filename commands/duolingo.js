import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "duolingo",
  aliases: ["דואולינגו", "דולינגו"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת duolingo הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Duolingo*
🔢 *גירסא:* v6.92.5
📦 *גודל:* 47 MB
💾 *סוג:* לימוד שפות
🎯 *תוכן:*
למד שפות חדשות בצורה מהנה ויעילה — אנגלית, ספרדית, צרפתית ועוד 40 שפה בחינם לגמרי.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/duolingo-329/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/duolingo-language-lessons-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת duolingo:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
