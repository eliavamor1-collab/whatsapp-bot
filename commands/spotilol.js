let savedMessage = null;

export default {
  trigger: "spotilol",
  aliases: ["ספוטילול", "ספוטי לול"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת spotilol הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Spotilol*
💾 *סוג:* סטרימינג מוזיקה
🎯 *תוכן:*
ספוטיפיי פרוץ שעובד — כל השירים, הפודקאסטים והפלייליסטים בלי הגבלות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://drive.google.com/file/d/13ymz7do-IaCwJ-iTq04Y9SAdapDSAaAk/view?usp=sharing
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Spotilol...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Spotilol בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIbb8PreAywlMvGT0PTMSsaNf0cEcLtNdxRYgmdGD-kQ&s=10" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Spotilol הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת spotilol:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
