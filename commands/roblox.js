let savedMessage = null;

export default {
  trigger: "roblox",
  aliases: ["רובלוקס"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת roblox הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*רובלוקס*
🔢 *גירסא:* V2.732.1043
📦 *גודל:* 180 MB
💾 *סוג:* משחק
🎯 *תוכן:*
עולם וירטואלי שבו יוצרים, משתפים ומשחקים עם מיליוני שחקנים ברחבי העולם.
כולל: Mega Menu, Fly, Jump, Teleport ועוד...

ℹ️ *הערות:*
פשוט להתקין ולשחק

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/download/roblox-123/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Roblox...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Roblox בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://9mod.com/wp-content/uploads/2024/05/roblox-150x150.webp" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Roblox הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת roblox:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
