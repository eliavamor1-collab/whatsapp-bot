let savedMessage = null;

export default {
  trigger: "spotify",
  aliases: ["ספוטיפיי", "ספוטיפי"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת spotify הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Spotify Music*
🔢 *גירסא:* v9.1.72.1891
📦 *גודל:* 72 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
פלטפורמת המוזיקה המובילה בעולם — האזן ל-80 מיליון שירים, פודקאסטים ופלייליסטים מותאמים אישית.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://vexfile.com/d_bucket/G4Ciyoru8A
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Spotify...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Spotify בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/spotify-music-and-podcasts-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Spotify הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת spotify:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
