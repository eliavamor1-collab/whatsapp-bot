export default {
  trigger: "rider",
  aliases: ["/rider"],

  async execute(sock, message) {
    console.log("🚀 RIDER EXECUTE הופעל!");

    const jid = message.key.remoteJid;

    // קישור לתמונה יציבה שלא חוסמת בקשות משרתים (Imgur)
    const imageUrl = "https://i.imgur.com/7bQeX6j.png";
    const downloadUrl = "https://liteapks.com/download/rider-14435/1";

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
      // שליחת הודעה עם תמונה וכפתור קישור מודרני
      await sock.sendMessage(
        jid,
        {
          image: { url: imageUrl },
          caption: bodyText,
          footer: "לחץ על הכפתור למטה להורדה",
          interactiveButtons: [
            {
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "📥 הורד את המשחק",
                url: downloadUrl,
                merchant_url: downloadUrl
              })
            }
          ]
        },
        { quoted: message }
      );
      console.log("✅ הודעת Rider עם כפתור נשלחה בהצלחה!");
    } catch (err) {
      console.error("❌ שגיאה בשליחת הודעה עם כפתור, שולח טקסט בלבד:", err);

      // גיבוי מלא עם קישור בטקסט במקרה של חוסר תמיכה בלקוח
      const fallbackText = `${bodyText}\n\n📲 *קישור להורדה:* ${downloadUrl}`;
      await sock.sendMessage(jid, { text: fallbackText }, { quoted: message });
    }
  }
};
