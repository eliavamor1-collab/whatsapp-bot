let savedMessage = null;

export default {
  trigger: "amazon prime",
  aliases: ["אמזון פריים", "prime video", "פריים וידאו"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת amazon prime הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Amazon Prime Video*
🔢 *גירסא:* v3.0.468.1357
📦 *גודל:* 39 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
פלטפורמת הסטרימינג של אמזון — סרטים, סדרות ותכנים מקוריים פרימיום, פתוחים לגמרי בחינם.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

📲 *קישור להורדה:*
https://liteapks.com/download/amazon-prime-video-285/1`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Amazon Prime...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Amazon Prime בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/amazon-prime-video-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Amazon Prime הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת amazon prime:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
