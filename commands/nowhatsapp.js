let savedMessage = null;

export default {
  trigger: "nowhatsapp",
  aliases: ["נוווצאפ", "no whatsapp"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת nowhatsapp הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*NOWhatsApp*
🔢 *גירסא:*
v10.08
📦 *גודל:*
53 MB
💾 *סוג:*
אפליקציה
🎯 *תוכן:*
גרסה מתקדמת של ווצאפ עם ערכות עיצוב, פרטיות מוגברת, שליחת קבצים גדולים, ועוד פיצ'רים שלא קיימים בווצאפ הרגיל.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

📲 *קישור להורדה:*
https://liteapks.com/nowhatsapp-1.html`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת NOWhatsApp...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת NOWhatsApp בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/nowhatsapp-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת NOWhatsApp הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת nowhatsapp:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
