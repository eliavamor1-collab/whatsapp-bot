import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "lightroom",
  aliases: ["לייטרום"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת lightroom הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Lightroom*
🔢 *גירסא:* v11.5.01
📦 *גודל:* 117 MB
💾 *סוג:* עריכת תמונות
🎯 *תוכן:*
עורך תמונות מקצועי של Adobe — שלוט על הצבעים, האור והסגנון של כל תמונה ברמת פרו.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/adobe-lightroom-205/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/lightroom-photo-editor-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת lightroom:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
