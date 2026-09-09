import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "youtube vanced",
  aliases: ["יוטיוב ונסד", "youtube vanced"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת youtube vanced הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*YouTube Vanced*
🔢 *גירסא:* v21.32.5
📦 *גודל:* 89 MB
💾 *סוג:* סטרימינג וידאו
🎯 *תוכן:*
יוטיוב ללא פרסומות עם ניגון ברקע — הגרסה הקלאסית האהובה שעדיין עובדת.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/youtube-vanced-134/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/05/logo-e1635186772863-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת youtube vanced:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
