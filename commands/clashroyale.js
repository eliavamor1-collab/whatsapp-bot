import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "clash royale",
  aliases: ["קלאש רויאל"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת clash royale הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Clash Royale*
🔢 *גירסא:* v150535029
📦 *גודל:* 1.03 GB
💾 *סוג:* משחק
🎯 *תוכן:*
משחק אסטרטגיה בזמן אמת — אסוף קלפים, בנה חפיסה ותלחם נגד שחקנים מכל העולם בקרבות PvP של 3 דקות. הרוס את המגדלים של היריב והגן על שלך!
כולל משאבים בלתי מוגבלים 💎

ℹ️ *הערות:*
פשוט להתקין ולשחק

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/download/clash-royale-1454/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://9mod.com/wp-content/uploads/2024/06/clash-royale-150x150.webp" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת clash royale:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
