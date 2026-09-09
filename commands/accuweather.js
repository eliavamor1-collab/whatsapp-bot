import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "accuweather",
  aliases: ["מזג אוויר", "אקיווודר"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*AccuWeather*
🔢 *גירסא:* v21.1.15
📦 *גודל:* ~50 MB
💾 *סוג:* מזג אוויר
🎯 *תוכן:*
תחזית מזג אוויר הכי מדויקת — לדקה הקרובה, לשעה, לשבוע. התראות גשם, מפת רדאר, ואינדקס UV.

ℹ️ *הערות:*
פרימיום פרוץ — בלי פרסומות`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת accuweather הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*AccuWeather*
🔢 *גירסא:* v21.1.15
📦 *גודל:* ~50 MB
💾 *סוג:* מזג אוויר
🎯 *תוכן:*
תחזית מזג אוויר הכי מדויקה — לדקה הקרובה, לשעה, לשבוע. התראות גשם, מפת רדאר, ואינדקס UV.

ℹ️ *הערות:*
פרימיום פרוץ — בלי פרסומות

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/accuweather.html
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://play-lh.googleusercontent.com/jJsBxq-eGf_FfxJb5xqU4aXFf0rGxNK_1r4HUBgT-FJCxRRMQ5dYMQ3PXiqJfkZHlQ" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת accuweather:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
