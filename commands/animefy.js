let savedMessage = null;

export default {
  trigger: "animefy",
  aliases: ["אנימפי", "אנימה וידאו", "anime video"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת animefy הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
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

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Animefy...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Animefy בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/5oT6CudF6PKzKJqFjADzq4m8dCbzFNv5BQ5p1OC3KWh1h1RWKlFEMaHdUGLxXFdMBg=w240-h480" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Animefy הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת animefy:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
