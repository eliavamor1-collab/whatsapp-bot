let savedMessage = null;

export default {
  trigger: "capcut",
  aliases: ["קאפקאט", "cap cut", "קאפ קאט"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*CapCut – עורך וידאו*
🔢 *גירסא:* v18.8.0
📦 *גודל:* 297.84 MB
💾 *סוג:* עריכת וידאו
🎯 *תוכן:*
עורך הוידאו המוביל של TikTok — חתוך, ערוך, הוסף מוזיקה, אפקטים ומדבקות ליצירת סרטונים מקצועיים בקלות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת capcut הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*CapCut – עורך וידאו*
🔢 *גירסא:* v18.8.0
📦 *גודל:* 297.84 MB
💾 *סוג:* עריכת וידאו
🎯 *תוכן:*
עורך הוידאו המוביל של TikTok — חתוך, ערוך, הוסף מוזיקה, אפקטים ומדבקות ליצירת סרטונים מקצועיים בקלות.

ℹ️ *הערות:*
פשוט להתקין ולהשתמש

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://liteapks.com/download/capcut-video-editor-311/1
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        console.log("♻️ משתמש בהודעה שמורה בזיכרון לשליחת CapCut...");
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        console.log("📸 שולח תמונת CapCut בפעם הראשונה...");
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://liteapks.com/wp-content/uploads/2022/04/capcut-video-editor-150x150.png" },
            caption: captionText
          },
          { quoted: message }
        );

        if (sentMsg) {
          savedMessage = sentMsg;
          console.log("✅ הודעת CapCut הראשונה שנשלחה נשמרה בזיכרון!");
        }
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת capcut:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
