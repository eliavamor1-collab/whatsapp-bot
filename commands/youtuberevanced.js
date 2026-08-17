let savedMessage = null;

export default {
  trigger: "youtube revanced",
  aliases: ["יוטיוב ריוונסד", "revanced", "ריוונסד"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת youtube revanced הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*YouTube ReVanced*
🔢 *גירסא:* v21.32.5
📦 *גודל:* 50 MB
💾 *סוג:* אפליקציה
🎯 *תוכן:*
יוטיוב ללא פרסומות עם ניגון ברקע, SponsorBlock, החזרת כפתור הדיסלייק, ועוד — חינם לחלוטין.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/youtube-revanced-71686/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת YouTube ReVanced...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת YouTube ReVanced בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/youtube-revanced-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת YouTube ReVanced הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת youtube revanced:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
