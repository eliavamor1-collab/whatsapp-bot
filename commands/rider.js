import axios from "axios";

// שמירת ההודעה הראשונה שנשלחה
let originalRiderMessage = null;

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
      // אם כבר שלחנו את ההודעה בעבר - מעבירים אותה (ווצאפ לא יוריד אותה מחדש בטלפון)
      if (originalRiderMessage) {
        console.log("🔄 מעביר את ההודעה הקיימת (חוסך הורדה בטלפון)...");
        await sock.sendMessage(jid, { forward: originalRiderMessage });
        console.log("✅ הודעת Rider הועברה בהצלחה!");
        return;
      }

      // בפעם הראשונה: מורידים ושולחים תמונה חדשה
      console.log("📸 שולח תמונה בפעם הראשונה...");
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data, "binary");

      originalRiderMessage = await sock.sendMessage(
        jid,
        {
          image: imageBuffer,
          caption: bodyText
        },
        { quoted: message }
      );

      console.log("✅ הודעת Rider הראשונה שנשלחה נשמרה בזיכרון!");
    } catch (err) {
      console.error("❌ שגיאה בשליחה:", err);
      // אם הייתה שגיאה בהעברה, מאפסים ומנסים לשלוח טקסט
      originalRiderMessage = null;
      await sock.sendMessage(jid, { text: bodyText }, { quoted: message });
    }
  }
};
