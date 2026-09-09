import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "pic retouch",
  aliases: ["ai retouch", "פיק ריטוש", "פיק ריטאצ", "פיק ריטאצ'"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת pic retouch הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Pic Retouch – Remove Objects*
🔢 *גירסא:* v1.362.96
📦 *גודל:* 42 MB
💾 *סוג:* עריכת תמונות AI
🎯 *תוכן:*
הסר אובייקטים לא רצויים מתמונות בקלות עם AI — אנשים, רקעים, כבלי חשמל ועוד, בלחיצה אחת.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/pic-retouch-remove-objects-360706/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2023/12/pic-retouch-remove-objects-150x150.webp" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת pic retouch:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
