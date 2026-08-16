let savedMessageKey = null;

export default {
  // מילת הפעלה ראשית
  trigger: "roblox",

  // מילים נוספות שיפעילו את הפקודה (כולל בעברית ועם סלאש)
  aliases: ["/roblox", "רובלוקס", "/רובלוקס"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת roblox הופעלה!");

    const captionText = `📱 *שם האפליקציה:*
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
      // שליחת התמונה ישירות מהקישור ברשת
      const sentMsg = await sock.sendMessage(jid, {
        image: { url: "https://liteapks.com/wp-content/uploads/2025/08/download-150x150.png" },
        caption: captionText
      });

      if (sentMsg) {
        savedMessageKey = sentMsg.key;
        console.log("✅ תמונה וטקסט של Roblox נשלחו בהצלחה!");
      }
    } catch (error) {
      console.error("שגיאה בשליחת הודעת roblox:", error);
    }
  }
};
