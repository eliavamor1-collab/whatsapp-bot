import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "soundcloud",
  aliases: ["סאונדקלאוד", "סאונד קלאוד"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת soundcloud הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*SoundCloud*
🔢 *גירסא:* v2026.08.13
📦 *גודל:* 90 MB
💾 *סוג:* סטרימינג מוזיקה
🎯 *תוכן:*
פלטפורמת סטרימינג מוזיקה פופולרית עם מיליוני שירים ואמנים עצמאיים. גרסת פרימיום ללא פרסומות.

ℹ️ *הערות:*
Premium Unlocked + ללא פרסומות

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/soundcloud-119161/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2025/08/unnamed-34-150x150.webp" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת soundcloud:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
