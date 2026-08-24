import { sendSuspended } from "./suspended.js";

let savedMessage = null;

export default {
  trigger: "youtube music",
  aliases: ["יוטיוב מיוזיק", "youtube music"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת youtube music הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*יוטיוב מיוזיק מורפ*
🔢 *גירסא:* v9.15.51
📦 *גודל:* 70.98 MB
💾 *סוג:* סטרימינג מוזיקה
🎯 *תוכן:*
פלטפורמת הזרמת מוזיקה עולמית שבה תוכלו להאזין, לשתף שירים וליצור פלייליסטים מתוך קטלוג של מיליוני אמנים ברחבי העולם.

ℹ️ *הערות:*
עיקבו בדיוק אחר הוראות ההתקנה בסירטון פה:
https://youtube.com/shorts/PSjKGzsOzVs?si=O9UdvOMJm17gCV_N

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
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת youtube music...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת youtube music בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/youtube-music-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת youtube music הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת youtube music:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
