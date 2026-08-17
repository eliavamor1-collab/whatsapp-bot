let savedMessage = null;

export default {
  trigger: "pic retouch",
  aliases: ["ai retouch", "פיק ריטוש", "ריטוש", "retouch", "פיק ריטאצ", "פיק ריטאצ'"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת pic retouch הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Pic Retouch – Remove Objects*
🔢 *גירסא:* v1.362.96
📦 *גודל:* 42 MB
💾 *סוג:* עריכת תמונות AI
🎯 *תוכן:*
הסר אובייקטים לא רצויים מתמונות בקלות עם AI — אנשים, רקעים, כבלי חשמל ועוד, בלחיצה אחת.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/pic-retouch-remove-objects-360706/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Pic Retouch...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Pic Retouch בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2023/12/pic-retouch-remove-objects-150x150.webp" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Pic Retouch הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת pic retouch:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
