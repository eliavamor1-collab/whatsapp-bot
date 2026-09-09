import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "instagram",
  aliases: ["אינסטגרם"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת instagram הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Instagram*
🔢 *גירסא:* v442.0.0.46.79
📦 *גודל:* 54 MB
💾 *סוג:* רשת חברתית
🎯 *תוכן:*
אינסטגרם ללא פרסומות עם פיצ'רים מיוחדים — הורדת תמונות וסרטונים, הסתרת סטטוס פעילות, ערכות נושא, ועוד.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://drive.google.com/file/d/1j50X-jUqXT_65fC2WJWcnEYig0nq_Tbx/view?usp=sharing
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/instagram-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת instagram:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
