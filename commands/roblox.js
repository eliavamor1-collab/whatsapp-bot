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
🔢 *גירסא:*
v2.732.1043
📦 *גודל:*
180 MB
💾 *סוג:*
משחק
🎯 *תוכן:*
עולם וירטואלי שבו תוכלו ליצור, לשתף חוויות ולשחק עם מיליוני שחקנים ברחבי העולם.

ℹ️ *הערות:*
פשוט להתקין ולשחק

📲 *קישור להורדה:*
https://liteapks.com/download/roblox-14564/1`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Roblox...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Roblox בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2025/08/download-150x150.png" },
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
