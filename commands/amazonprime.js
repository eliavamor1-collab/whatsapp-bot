import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "amazon prime",
  aliases: ["אמזון פריים", "prime video", "פריים וידאו"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת amazon prime הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Amazon Prime Video*
🔢 *גירסא:* v3.0.468.1357
📦 *גודל:* 39 MB
💾 *סוג:* סטרימינג סרטים
🎯 *תוכן:*
פלטפורמת הסטרימינג של אמזון — סרטים, סדרות ותכנים מקוריים פרימיום, פתוחים לגמרי בחינם.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/amazon-prime-video-285/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/amazon-prime-video-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת amazon prime:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
