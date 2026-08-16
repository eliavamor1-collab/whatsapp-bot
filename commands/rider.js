let savedMessage = null;

const riderCommand = {
  trigger: "rider",
  aliases: ["ריידר"],
  
  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת rider הופעלה!");

    const captionText = 
`📱 *שם האפליקציה:*
*ריידר (Rider)*
🔢 *גירסא:*
v2.0.0
📦 *גודל:*
100 MB
💾 *סוג:*
משחק
🎯 *תוכן:*
משחק אקשן ופעלולים מלהיב עם מכוניות ניאון במסלולים מאתגרים!

ℹ️ *הערות:*
פשוט להתקין ולשחק

📲 *קישור להורדה:*
https://liteapks.com/download/rider-14435/1`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Rider...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
        return;
      }

      console.log("📸 שולח תמונת Rider בפעם הראשונה...");
      const sentMsg = await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/06/rider-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );

      if (sentMsg) {
        savedMessage = sentMsg;
        console.log("✅ הודעת Rider הראשונה שנשלחה נשמרה בזיכרון!");
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת rider:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};

export default riderCommand;
