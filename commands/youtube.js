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
🔢 *גירסא:*
v1.25.0
📦 *גודל:*
17.64 MB
💾 *סוג:*
אפליקיה
🎯 *תוכן:*
פלטפורמת וידאו עולמית שבה תוכלו ליצור, לשתף סרטונים ולצפות בתכנים עם מיליארדי משתמשים ברחבי העולם.

ℹ️ *הערות:*
עיקבו בדיוק אחר הוראות ההתקנה בסירטון פה:
https://www.youtube.com/watch?v=yMbi9G861Ys&t=4s
אפשר אחרי ההתקנה לשנות את האייקון של האפליקציה כמו ליוטיוב הרגיל

📲 *קישור להורדה:*
https://morphe.software/`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת youtube...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת youtube בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://1000logos.net/wp-content/uploads/2017/05/Youtube-Logo-500x281.png" },
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
