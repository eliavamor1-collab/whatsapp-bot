let savedMessage = null;

export default {
  trigger: "soundcloud",
  aliases: ["סאונדקלאוד", "סאונד קלאוד"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת soundcloud הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*SoundCloud*
🔢 *גירסא:* v2026.08.13
📦 *גודל:* 90 MB
💾 *סוג:* סטרימינג מוזיקה
🎯 *תוכן:*
פלטפורמת סטרימינג מוזיקה פופולרית עם מיליוני שירים ואמנים עצמאיים. גרסת פרימיום ללא פרסומות.

ℹ️ *הערות:*
Premium Unlocked + ללא פרסומות

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/soundcloud-119161/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת SoundCloud...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת SoundCloud בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2025/08/unnamed-34-150x150.webp" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת SoundCloud הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת soundcloud:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
