import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "inshot",
  aliases: ["אינשוט"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת inshot הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*InShot Pro*
🔢 *גירסא:* v2.222.1548
📦 *גודל:* 79 MB
💾 *סוג:* עריכת וידאו ותמונות
🎯 *תוכן:*
עורך וידאו ותמונות מקצועי — חתוך, הוסף מוזיקה, פילטרים, מעברים וטקסט לסרטונים שלך בקלות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/inshot-pro-107/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/video-editor-maker-inshot-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת inshot:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
