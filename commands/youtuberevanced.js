import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "youtube revanced",
  aliases: ["יוטיוב ריוונסד", "youtube revanced"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת youtube revanced הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*YouTube ReVanced*
🔢 *גירסא:* v21.32.5
📦 *גודל:* 50 MB
💾 *סוג:* סטרימינג וידאו
🎯 *תוכן:*
יוטיוב ללא פרסומות עם ניגון ברקע, SponsorBlock, החזרת כפתור הדיסלייק, ועוד — חינם לחלוטין.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/youtube-revanced-71686/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/youtube-revanced-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת youtube revanced:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
