let savedMessage = null;

export default {
  trigger: "clash royale",
  aliases: ["clashroyale", "קלאש רויאל"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת clash royale הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
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

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Clash Royale...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Clash Royale בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://9mod.com/wp-content/uploads/2024/06/clash-royale-150x150.webp" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Clash Royale הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת clash royale:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
