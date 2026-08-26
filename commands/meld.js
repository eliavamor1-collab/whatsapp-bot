let savedMessage = null;

export default {
  trigger: "meld",
  aliases: ["מלד"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Meld*
🔢 *גירסא:* v0.8.8
📦 *גודל:* 23.4 MB
💾 *סוג:* סטרימינג מוזיקה ואודיו
🎯 *תוכן:*
קליינט מוזיקה שמשלב בין Spotify ל-YouTube Music — ההמלצות והפלייליסטים של ספוטיפיי עם הקטלוג של יוטיוב מיוזיק, בלי צורך בפרימיום.

ℹ️ *הערות:*
📺 מדריך התקנה: https://youtube.com/shorts/utw6NESn670?si=fL-njGIf1JiZ6y0o`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת meld הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Meld*
🔢 *גירסא:* v0.8.8
📦 *גודל:* 23.4 MB
💾 *סוג:* סטרימינג מוזיקה ואודיו
🎯 *תוכן:*
קליינט מוזיקה שמשלב בין Spotify ל-YouTube Music — ההמלצות והפלייליסטים של ספוטיפיי עם הקטלוג של יוטיוב מיוזיק, בלי צורך בפרימיום.

ℹ️ *הערות:*
📺 מדריך התקנה: https://youtube.com/shorts/utw6NESn670?si=fL-njGIf1JiZ6y0o

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://drive.google.com/file/d/1OA4n2XHR7ymJc6qZG_dXzrghP34khCFm/view?usp=sharing
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Meld...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Meld בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/ng6R8Cl93dqQN6f0b0m1UQrWB4rVnHJZlklIsJApYU-ZbyRqUZe-1W-yZNZKl5c2lS3TEeOrRHtMRWToaiAC" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Meld הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת meld:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
