let savedMessage = null;

export default {
  trigger: "youtube",
  aliases: ["יוטיוב"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת youtube הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*יוטיוב מורפ*
🔢 *גירסא:* v1.25.0
📦 *גודל:* 17.64 MB
💾 *סוג:* סטרימינג וידאו
🎯 *תוכן:*
פלטפורמת וידאו עולמית שבה תוכלו ליצור, לשתף סרטונים ולצפות בתכנים עם מיליארדי משתמשים ברחבי העולם.

ℹ️ *הערות:*
עיקבו בדיוק אחר הוראות ההתקנה בסירטון פה:
https://youtube.com/shorts/y3WKhi2EfOU?si=TJVx-UNczW0RhuvJ
אפשר אחרי ההתקנה לשנות את האייקון של האפליקציה כמו ליוטיוב הרגיל

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדת Morphe* ⬇️
https://morphe.software/

📦 *לחץ להורדת Micro G* 📦
https://drive.google.com/file/d/1G-sWLiTa5eIoGwxVsWH4sDjZWEgnbRUm/view?usp=sharing

⚙️ *לחץ להורדת הגדרות ליוטיוב מורפ* ⚙️
https://drive.google.com/file/d/1d7fRifBeLIo8VIkbSb_1FLkG0_64br1D/view?usp=sharing
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת youtube...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת youtube בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://images.icon-icons.com/1488/PNG/512/5295-youtube-i_102568.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת youtube הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת youtube:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
