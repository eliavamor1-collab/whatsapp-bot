let savedMessage = null;

export default {
  trigger: "מקליט שיחות",
  aliases: ["call recorder", "cube acr", "קיוב אקר", "מקליט"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Call Recorder — Cube ACR*
💾 *סוג:* מקליט שיחות
🎯 *תוכן:*
מקליט השיחות המתקדם ביותר לאנדרואיד — מקליט שיחות נכנסות ויוצאות אוטומטית, כולל שיחות WhatsApp, Viber, Skype ועוד אפליקציות VoIP.

ℹ️ *הערות:*
⚠️ האפליקציה לא עובדת בהרבה טלפונים עקב מגבלות של אנדרואיד 10+ שחוסם הקלטת שיחות. יש להוריד גם את התוסף Talker לתמיכה מלאה`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת מקליט שיחות הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Call Recorder — Cube ACR*
💾 *סוג:* מקליט שיחות
🎯 *תוכן:*
מקליט השיחות המתקדם ביותר לאנדרואיד — מקליט שיחות נכנסות ויוצאות אוטומטית, כולל שיחות WhatsApp, Viber, Skype ועוד אפליקציות VoIP.

ℹ️ *הערות:*
⚠️ האפליקציה לא עובדת בהרבה טלפונים עקב מגבלות של אנדרואיד 10+ שחוסם הקלטת שיחות. יש להוריד גם את התוסף Talker לתמיכה מלאה

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/call-recorder-cube-acr-78937/1

📲 *להורדת התוסף Talker:*
https://liteapks.com/download/talker-acr-220773/2
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת Call Recorder...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת Call Recorder בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/12/call-recorder-cube-acr-150x150.jpg" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת Call Recorder הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת call recorder:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
