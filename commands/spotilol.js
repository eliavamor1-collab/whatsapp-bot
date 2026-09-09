import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "spotilol",
  aliases: ["ספוטילול", "ספוטי לול"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת spotilol הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Spotilol*
🔢 *גירסא:* v1.0.10
📦 *גודל:* 10.6 MB
💾 *סוג:* סטרימינג מוזיקה
🎯 *תוכן:*
ספוטיפיי פרוץ שעובד — כל השירים, הפודקאסטים והפלייליסטים בלי הגבלות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://drive.google.com/file/d/13ymz7do-IaCwJ-iTq04Y9SAdapDSAaAk/view?usp=sharing
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIbb8PreAywlMvGT0PTMSsaNf0cEcLtNdxRYgmdGD-kQ&s=10" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת spotilol:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
