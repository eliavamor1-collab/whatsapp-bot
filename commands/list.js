export default {
  trigger: "list",
  aliases: ["רשימה"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת list הופעלה!");

    // כאן תוכל לערוך ולכתוב את כל הטקסט שתרצה שהבוט ישלח
    const listText = 
`📋 *רשימת האפליקציות והמשחקים הזמינים:*

1. *רובלוקס* — לפקודה כתוב: *רובלוקס* או *roblox*
2. *ריידר* — לפקודה כתוב: *ריידר* או *rider*
3. *סאבווי סארפרס* — לפקודה כתוב: *סאבווי* או *subway*

💬 *לפרטים נוספים ופקודות נוספות תכתבו את שם המשחק.*`;

    try {
      await sock.sendMessage(
        jid,
        { text: listText },
        { quoted: message }
      );
      console.log("✅ הודעת הרשימה נשלחה בהצלחה!");
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת רשימה:", error);
    }
  }
};
