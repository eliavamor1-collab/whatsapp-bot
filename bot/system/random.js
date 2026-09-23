export default {
  trigger: "random",
  aliases: ["אקראי", "הפתעה"],

  async execute(sock, message, allCommands) {
    const jid = message.key.remoteJid;

    console.log("🎲 פקודת random הופעלה!");

    // סינון הפקודות — רק אפליקציות (לא start, list, random עצמו)
    const excludeCommands = new Set(["start", "list", "random", "רשימה", "תפריט", "אקראי", "הפתעה", "surprise"]);
    
    const appCommands = Array.from(allCommands.values()).filter((cmd) => {
      return !excludeCommands.has(cmd.trigger.toLowerCase());
    });

    // הסרת כפילויות (אותו command עם aliases שונים)
    const uniqueApps = [];
    const seen = new Set();
    
    for (const cmd of appCommands) {
      if (!seen.has(cmd.trigger)) {
        uniqueApps.push(cmd);
        seen.add(cmd.trigger);
      }
    }

    if (uniqueApps.length === 0) {
      await sock.sendMessage(jid, { text: "אין אפליקציות זמינות כרגע 😕" }, { quoted: message });
      return;
    }

    // בחירה אקראית
    const randomApp = uniqueApps[Math.floor(Math.random() * uniqueApps.length)];

    console.log(`🎲 נבחר אקראית: ${randomApp.trigger}`);

    try {
      // שליחת הודעת הקדמה
      await sock.sendMessage(
        jid,
        { text: `🎲 *אפליקציה אקראית בשבילך:*\n\n🎁 מכין את ההפתעה...` },
        { quoted: message }
      );

      // המתנה קטנה לדרמה
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // הפעלת הפקודה האקראית
      await randomApp.execute(sock, message);
      
      console.log(`✅ אפליקציה אקראית נשלחה בהצלחה: ${randomApp.trigger}`);
    } catch (error) {
      console.error("❌ שגיאה בשליחת אפליקציה אקראית:", error);
      await sock.sendMessage(jid, { text: "אופס, משהו השתבש 😅 נסה שוב!" }, { quoted: message });
    }
  }
};
