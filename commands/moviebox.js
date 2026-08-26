let savedMessage = null;

export default {
  trigger: "moviebox",
  aliases: ["מובי בוקס", "מוביבוקס", "סרטים"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*MovieBox*
🔢 *גירסא:* v4.0.01
📦 *גודל:* ~25 MB
💾 *סוג:* סטרימינג סרטים וסדרות
🎯 *תוכן:*
צפייה בסרטים וסדרות ישירות מהטלפון — קטלוג ענק, איכות HD, בלי תשלום. פרימיום פרוץ.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת moviebox הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*MovieBox*
🔢 *גירסא:* v4.0.01
📦 *גודל:* ~25 MB
💾 *סוג:* סטרימינג סרטים וסדרות
🎯 *תוכן:*
צפייה בסרטים וסדרות ישירות מהטלפון — קטלוג ענק, איכות HD, בלי תשלום. פרימיום פרוץ.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/moviebox.html
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/7RiG3UtMDhUMjGnMC_4r2v1R_bJF_JpqxA3n7wNYfCY1qMmP6gGS3tj4YbjJCf_Kafs" },
            caption: captionText
          },
          { quoted: message }
        );
        if (sentMsg) savedMessage = sentMsg;
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת moviebox:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
