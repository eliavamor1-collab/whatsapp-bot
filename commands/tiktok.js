import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "tiktok",
  aliases: ["טיקטוק", "tik tok", "טיק טוק"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת tiktok הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*TikTok*
🔢 *גירסא:* v46.5.5
📦 *גודל:* 184 MB
💾 *סוג:* רשת חברתית
🎯 *תוכן:*
רשת הסרטונים הקצרים הגדולה בעולם — בלי פרסומות, הורדת סרטונים בלי סימן מים, ופתיחת כל התכונות הפרימיום.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/tiktok-81/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/tiktok-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת tiktok:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
