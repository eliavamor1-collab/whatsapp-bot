import { applyLiveVersion } from "./versionFetcher.js";
import { sendSuspended } from "./suspended.js";

export default {
  trigger: "telegram",
  aliases: ["טלגרם"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת telegram הופעלה!");

    // השעייה זמנית
    return await sendSuspended(sock, message);

    let captionText = `📱 *שם האפליקציה:*
*Telegram*
🔢 *גירסא:* v12.9.2
📦 *גודל:* 67 MB
💾 *סוג:* מסנג'ר
🎯 *תוכן:*
מסנג'ר מהיר ומאובטח עם פרימיום — קבוצות ענק, ערוצים, שליחת קבצים גדולים ועוד — ללא פרסומות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/telegram-810/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/telegram-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת telegram:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
