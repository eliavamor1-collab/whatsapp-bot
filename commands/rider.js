import { applyLiveVersion } from "./versionFetcher.js";

export default {
  trigger: "rider",
  aliases: ["ריידר"],
  fileUrl: "https://github.com/eliavamor1-collab/whatsapp-bot/releases/download/apps/Rider-v3.06.0.07-mod.apk",
  fileName: "Rider-v3.06.0.07-mod.apk",

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*ריידר (Rider)*
🔢 *גירסא:* v3.06.0.07
📦 *גודל:* 100 MB
💾 *סוג:* משחק
🎯 *תוכן:*
משחק אקשן ופעלולים מלהיב עם מכוניות ניאון במסלולים מאתגרים!

ℹ️ *הערות:*
פשוט להתקין ולשחק`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת rider הופעלה!");

    let captionText =
`📱 *שם האפליקציה:*
*ריידר (Rider)*
🔢 *גירסא:* v3.06.0.07
📦 *גודל:* 100 MB
💾 *סוג:* משחק
🎯 *תוכן:*
משחק אקשן ופעלולים מלהיב עם מכוניות ניאון במסלולים מאתגרים!

ℹ️ *הערות:*
פשוט להתקין ולשחק

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/rider-14435/1
━━━━━━━━━━━━━━━`;

    // מחליף את הגרסה בגרסה החיה מ-Mod Updater (אם זמינה)
    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      console.log("📸 שולח תמונת Rider...");
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/06/rider-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת rider:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
