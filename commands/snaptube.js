let savedMessage = null;

export default {
  trigger: "snaptube",
  aliases: ["סנאפטיוב", "snapchat", "סנפצ'אט"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת snaptube הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Snaptube*
🔢 *גירסא:* v7.66.1
📦 *גודל:* 35 MB
💾 *סוג:* הורדת סרטונים
🎯 *תוכן:*
הורד סרטונים ומוזיקה מיוטיוב, פייסבוק, אינסטגרם ועוד — באיכות 4K, בחינם ובלי פרסומות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/snaptube-173/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Snaptube...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Snaptube בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/snaptube-mod-liteapks-e1651227086725-150x150.jpg" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Snaptube הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת snaptube:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
