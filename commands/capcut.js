let savedMessage = null;

export default {
  trigger: "capcut",
  aliases: ["קאפקאט", "cap cut"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת capcut הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*CapCut – עורך וידאו*
🔢 *גירסא:*
v18.8.0
📦 *גודל:*
297.84 MB
💾 *סוג:*
אפליקציה
🎯 *תוכן:*
עורך הוידאו המוביל של TikTok — חתוך, ערוך, הוסף מוזיקה, אפקטים ומדבקות ליצירת סרטונים מקצועיים בקלות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

📲 *קישור להורדה:*
https://liteapks.com/capcut-video-editor.html`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת CapCut...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת CapCut בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/99/40/59/994059df-fb25-26e3-db8d-2b9e29db9f6b/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/150x150bb.jpg" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת CapCut הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת capcut:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
