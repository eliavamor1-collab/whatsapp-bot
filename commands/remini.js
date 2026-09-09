import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "remini",
  aliases: ["רמיני", "רימיני"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת remini הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Remini – AI Photo Enhancer*
🔢 *גירסא:* v3.7.1411
📦 *גודל:* 135 MB
💾 *סוג:* שיפור תמונות AI
🎯 *תוכן:*
שפר תמונות ישנות, מטושטשות ובאיכות נמוכה לתמונות חדות וברורות באמצעות AI מתקדם.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/remini-ai-photo-enhancer-2689/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/remini-ai-photo-enhancer-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת remini:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
