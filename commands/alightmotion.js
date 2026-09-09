import { applyLiveVersion } from "./versionFetcher.js";
export default {
  trigger: "alight motion",
  aliases: ["אליית מושן", "אלייט מושן"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת alight motion הופעלה!");

    let captionText = `📱 *שם האפליקציה:*
*Alight Motion*
🔢 *גירסא:* v5.0.279
📦 *גודל:* 101 MB
💾 *סוג:* עריכת וידאו
🎯 *תוכן:*
אפליקציית עריכת וידאו מקצועית עם אנימציה, אפקטים ויזואליים, גרפיקה בתנועה — הכל פתוח ללא תשלום.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/alight-motion-175/1
━━━━━━━━━━━━━━━`;

    captionText = await applyLiveVersion(this.trigger, captionText);

    try {
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/04/alight-motion-150x150.png" },
          caption: captionText
        },
        { quoted: message }
      );
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת alight motion:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
