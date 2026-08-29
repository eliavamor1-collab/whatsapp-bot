let savedMessage = null;

export default {
  trigger: "spotui",
  aliases: ["ספוטוי"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת spotui הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Spotui*
🔢 *גירסא:* v1.0
📦 *גודל:* 13.66 MB
💾 *סוג:* סטרימינג מוזיקה
🎯 *תוכן:*
ספוטיפי פרוץ — כל השירים, הפודקאסטים והפלייליסטים בלי הגבלות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://drive.google.com/file/d/1JqNjgQHHYClSWu8FFnMFH1lhM_4tXQop/view?usp=sharing
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Spotui...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Spotui בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://static.rustore.ru/imgproxy/2lkwRVncQ2BRVm4gOzntmx_OHEwgtoL-fmZvNSvw9LA/preset:vk_og_img/plain/https://static.rustore.ru/2026/6/12/59/apk/2063722450/content/ICON/208494ac-88db-43b5-a2ec-e34282fd1140.png@webp" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Spotui הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת spotui:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
