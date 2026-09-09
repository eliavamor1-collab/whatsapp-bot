import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "mx player",
  aliases: ["מקס פלייר"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת mx player הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*MX Player*
🔢 *גירסא:* v3.0.13
📦 *גודל:* 56 MB
💾 *סוג:* נגן וידאו
🎯 *תוכן:*
נגן הוידאו המוביל לאנדרואיד — תומך בכל הפורמטים, כתוביות, וניגון חלק של כל סרטון.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/mx-player-651/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/mx-player-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת mx player:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
