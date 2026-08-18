import { sendSuspended } from "./suspended.js";

let savedMessage = null;

export default {
  trigger: "telegram",
  aliases: ["טלגרם"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת telegram הופעלה!");

    // השעייה זמנית
    return await sendSuspended(sock, message);

    const captionText =
`📱 *שם האפליקציה:*
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

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Telegram...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Telegram בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/telegram-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Telegram הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת telegram:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
