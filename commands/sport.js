export default {
  trigger: "ספורט",
  aliases: ["sport", "צפייה בספורט", "ערוצי ספורט", "liveball"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת ספורט הופעלה!");

    const captionText =
`⚽ *צפייה בערוצי ספורט בלייב!*

📺 *האתר:*
*LiveBall*

🎯 *תוכן:*
צפייה חינמית בשידורים חיים של משחקי ספורט — כדורגל, כדורסל, הוקי ועוד, ישירות מהדפדפן.

ℹ️ *הערות:*
לא דורש הורדה — פתח מהדפדפן ותיהנה!

━━━━━━━━━━━━━━━
🏒 *כניסה לערוץ הוקי:*
https://liveball.sx/hockey
━━━━━━━━━━━━━━━`;

    try {
      await sock.sendMessage(
        jid,
        { text: captionText },
        { quoted: message }
      );
      console.log("✅ הודעת ספורט נשלחה בהצלחה!");
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת ספורט:", error);
    }
  }
};
