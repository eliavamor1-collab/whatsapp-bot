import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "snaptube",
  aliases: ["סנאפטיוב"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת snaptube הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
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

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/snaptube-mod-liteapks-e1651227086725-150x150.jpg" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת snaptube:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
