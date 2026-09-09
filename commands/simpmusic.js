let savedMessage = null;

export default {
  trigger: "simpmusic",
  aliases: ["סימפ מיוזיק", "simp music"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*SimpMusic*
🔢 *גירסא:* v1.7.0
📦 *גודל:* 28.03 MB
💾 *סוג:* סטרימינג מוזיקה
🎯 *תוכן:*
נגן מוזיקה חינמי ופתוח קוד שמשתמש בספריית YouTube Music — האזן לכל שיר בחינם, בלי פרסומות ואפילו עם המסך כבוי! כולל פלייליסטים, תמלילים, סנכרון עם Spotify ועוד.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת simpmusic הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*SimpMusic*
🔢 *גירסא:* v1.7.0
📦 *גודל:* 28.03 MB
💾 *סוג:* סטרימינג מוזיקה
🎯 *תוכן:*
נגן מוזיקה חינמי ופתוח קוד שמשתמש בספריית YouTube Music — האזן לכל שיר בחינם, בלי פרסומות ואפילו עם המסך כבוי! כולל פלייליסטים, תמלילים, סנכרון עם Spotify ועוד.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://www.simpmusic.org/thank-you?platform=android&v=1.7.0&asset=SimpMusic-foss-arm64-v8a-release.apk
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת SimpMusic...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת SimpMusic בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0SUVpdyxodZiG9cyRO9HOpcMsG38cfkO3rvD6t58TIg&s" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת SimpMusic הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת simpmusic:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
