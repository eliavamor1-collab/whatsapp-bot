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
פשוט להתקין ולשחק

📲 *קישור להורדה:*
${downloadUrl}`;

    try {
      // הורדת התמונה ל-Buffer לשליחה יציבה
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data, "binary");

      // שליחת תמונה רגילה עם הטקסט והקישור בכתובית אחת
      await sock.sendMessage(
        jid,
        {
          image: imageBuffer,
          caption: bodyText
        },
        { quoted: message }
      );

      console.log("✅ הודעת Rider נשלחה בהצלחה!");
    } catch (err) {
      console.error("❌ שגיאה בשליחת התמונה, שולח טקסט בלבד:", err);

      await sock.sendMessage(
        jid,
        { text: bodyText },
        { quoted: message }
      );
    }
  }
};
