import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "speak translate",
  aliases: ["speaktranslate", "translate"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Speak & Translate*
🔢 *גירסא:* v5.1.0
📦 *גודל:* ~35 MB
💾 *סוג:* תרגום
🎯 *תוכן:*
מתרגם קולי בזמן אמת — מדברים בשפה אחת ומקבלים תרגום מיידי לכל שפה. תומך ביותר מ-100 שפות.

ℹ️ *הערות:*
פרימיום פרוץ — כל השפות פתוחות`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת speaktranslate הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Speak & Translate*
🔢 *גירסא:* v5.1.0
📦 *גודל:* ~35 MB
💾 *סוג:* תרגום
🎯 *תוכן:*
מתרגם קולי בזמן אמת — מדברים בשפה אחת ומקבלים תרגום מיידי לכל שפה. תומך ביותר מ-100 שפות.

ℹ️ *הערות:*
פרימיום פרוץ — כל השפות פתוחות

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/speak-translate-all-language.html
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://play-lh.googleusercontent.com/O0h-GgJuMMBv2V7J0CLiEtB6c8JKJyqkJMurcj_NQ4VH8Py7X-6gIXMer1kBNUX9SA" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת speaktranslate:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
