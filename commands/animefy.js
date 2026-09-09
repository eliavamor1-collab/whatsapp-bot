import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "animefy",
  aliases: ["אנימפי"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת animefy הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*AI Video Maker: Animefy*
🔢 *גירסא:* v2.37.10183
📦 *גודל:* 124 MB
💾 *סוג:* יצירת וידאו ותמונות AI
🎯 *תוכן:*
הפוך סלפי לסרטון אנימה או קריקטורה מתנועע! ה-AI ממיר תמונות לדמויות אנימה אקספרסיביות, יוצר סצנות מונפשות מתמונות סטטיות, ומייצר אווטארים ייחודיים לשיתוף ברשתות החברתיות.

ℹ️ *הערות:*
פרימיום פתוח — פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/download/ai-video-maker-animefy-156525/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://9mod.com/wp-content/uploads/2025/05/ai-video-maker-animefy-150x150.webp" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת animefy:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
