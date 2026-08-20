let savedMessage = null;

export default {
  trigger: "מזייף מיקום",
  aliases: ["fake gps", "פייק gps", "זייף מיקום"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*מזייף מיקום — Fake GPS Joystick*
🔢 *גירסא:* v4.1.25
📦 *גודל:* 5.5 MB
💾 *סוג:* כלי שימושי
🎯 *תוכן:*
זייף את המיקום שלך לכל מקום בעולם! שלוט עם ג'ויסטיק, צור מסלולים, ועבור לניו יורק, לונדון או כל מקום אחר בלחיצה אחת. מושלם למשחקים כמו Pokémon GO.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת מזייף מיקום הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*מזייף מיקום — Fake GPS Joystick*
🔢 *גירסא:* v4.1.25
📦 *גודל:* 5.5 MB
💾 *סוג:* כלי שימושי
🎯 *תוכן:*
זייף את המיקום שלך לכל מקום בעולם! שלוט עם ג'ויסטיק, צור מסלולים, ועבור לניו יורק, לונדון או כל מקום אחר בלחיצה אחת. מושלם למשחקים כמו Pokémon GO.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/fake-gps-location-joystick-93148/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Fake GPS...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Fake GPS בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2023/01/fake-gps-location-joystick-a-150x150.jpg" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Fake GPS הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת fake gps:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
