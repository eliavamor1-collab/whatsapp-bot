let savedMessage = null;

export default {
  trigger: "truecaller",
  aliases: ["טרוקולר", "טרו קולר"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת truecaller הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Truecaller Gold*
🔢 *גירסא:*
v26.32.7
📦 *גודל:*
77 MB
💾 *סוג:*
אפליקציה
🎯 *תוכן:*
זהה מתקשרים לא מוכרים, חסום שיחות ספאם ומטרידים, והקלט שיחות — כל זה במקום אחד.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

📲 *קישור להורדה:*
https://liteapks.com/truecaller-app.html`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Truecaller...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Truecaller בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/truecaller-caller-id-block-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Truecaller הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת truecaller:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
