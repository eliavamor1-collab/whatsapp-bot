export default {
  trigger: "rider",
  aliases: ["/rider"],

  async execute(sock, message) {
    console.log("🚀 RIDER EXECUTE הופעל!");

    const jid = message.key.remoteJid;

    const imageUrl =
      "https://static-images.aptoide.com/_next/image?url=https%3A%2F%2Fcdn.aptoide.com%2Fimgs%2F6%2F9%2F7%2F69777a504b00c4646a330b3c4d468df2_fgraphic.png&w=3840&q=60";
    const downloadUrl = "https://liteapks.com/download/rider-14435/1";

    const text = 
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
      // שליחת תמונה עם טקסט וקישור ישיר
      await sock.sendMessage(
        jid,
        {
          image: { url: imageUrl },
          caption: text
        },
        { quoted: message }
      );
      console.log("✅ הודעת Rider נשלחה בהצלחה!");
    } catch (err) {
      console.error("❌ שגיאה בשליחת הודעת Rider עם תמונה:", err);

      // גיבוי: שליחת טקסט בלבד במקרה של בעיה בטעינת התמונה
      try {
        await sock.sendMessage(jid, { text }, { quoted: message });
        console.log("✅ הודעת Rider (טקסט בלבד) נשלחה בהצלחה!");
      } catch (fallbackErr) {
        console.error("❌ שגיאה בשליחת הודעת גיבוי:", fallbackErr);
      }
    }
  }
};
