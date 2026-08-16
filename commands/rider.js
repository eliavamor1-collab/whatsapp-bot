import axios from "axios";

export default {
  trigger: "rider",
  aliases: ["/rider"],

  async execute(sock, message) {
    console.log("🚀 RIDER EXECUTE הופעל!");

    const jid = message.key.remoteJid;
    const downloadUrl = "https://liteapks.com/download/rider-14435/1";
    const imageUrl = "https://tiermaker.com/images/templates/rider-ketchapp-game-obstacle-tier-list-273305/2733051675445032.png";

    const bodyText = 
`📱 *שם האפליקציה:*
*Rider*
🔢 *גירסא:*
v3.06.0.05
📦 *גודל:*
146.2 MB
💾 *סוג:*
משחק

🎯 *תוכן:*
משחק פעלולים עתידני וממכר, שבו נוהגים במסלולי ניאון מאתגרים ומנסים לא להתרסק.

ℹ️ *הערות:*
פשוט להתקין ולשחק`;

    try {
      // 1. הורדת התמונה ל-Buffer במידה וצריך
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data, "binary");

      // 2. שליחה אחת נקייה כולל תמונה, כתובית וכפתור קישור
      await sock.sendMessage(
        jid,
        {
          image: imageBuffer,
          caption: bodyText,
          footer: "לחץ למטה להורדה",
          buttons: [
            {
              buttonId: "download_link",
              buttonText: { displayText: "📥 הורד את המשחק" },
              type: 1
            }
          ],
          viewOnce: true
        },
        { quoted: message }
      );

      console.log("✅ הודעת Rider נשלחה בהצלחה!");
    } catch (err) {
      console.error("❌ שגיאה בשליחה, שולח בפורמט טקסט ותמונה רגילים:", err);

      // גיבוי למקרה שהכפתור נחסם - תמונה עם הטקסט והקישור יחד
      await sock.sendMessage(
        jid,
        {
          image: { url: imageUrl },
          caption: `${bodyText}\n\n📲 *קישור להורדה:* ${downloadUrl}`
        },
        { quoted: message }
      );
    }
  }
};
