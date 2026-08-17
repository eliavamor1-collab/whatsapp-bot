let savedMessage = null;

export default {
  trigger: "mx player",
  aliases: ["מקס פלייר", "mx"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת mx player הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*MX Player*
🔢 *גירסא:* v3.0.13
📦 *גודל:* 56 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
נגן הוידאו המוביל לאנדרואיד — תומך בכל הפורמטים, כתוביות, וניגון חלק של כל סרטון.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/mx-player-651/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת MX Player...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת MX Player בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/mx-player-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת MX Player הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת mx player:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
