import { applyLiveVersion } from "./versionFetcher.js";
import { sendSuspended } from "./suspended.js";

export default {
  trigger: "nowhatsapp",
  aliases: ["נוווצאפ", "נווצאפ"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת nowhatsapp הופעלה!");

    // השעייה זמנית
    return await sendSuspended(sock, message);

    let captionText = `📱 *שם האפליקציה:*
*NOWhatsApp*
🔢 *גירסא:* v10.08
📦 *גודל:* 53 MB
💾 *סוג:* מסנג'ר
🎯 *תוכן:*
גרסה מתקדמת של ווצאפ עם ערכות עיצוב, פרטיות מוגברת, שליחת קבצים גדולים, ועוד פיצ'רים שלא קיימים בווצאפ הרגיל.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/nowhatsapp-18045/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/07/nowhatsapp-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת nowhatsapp:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
