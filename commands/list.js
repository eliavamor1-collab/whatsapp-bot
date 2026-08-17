export default {
  trigger: "list",
  aliases: ["רשימה"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת list הופעלה!");

    const listText =
`📋 *רשימת האפליקציות והמשחקים הזמינים:*

1. *רובלוקס* — כתוב: *רובלוקס* או *roblox*
2. *ריידר* — כתוב: *ריידר* או *rider*
3. *סאבווי סארפרס* — כתוב: *סאבווי* או *subway*
4. *יוטיוב מורפ* — כתוב: *יוטיוב* או *youtube*
5. *יוטיוב מיוזיק מורפ* — כתוב: *יוטיוב מיוזיק* או *youtube music*
6. *קאפקאט* — כתוב: *קאפקאט* או *capcut*
7. *טרוקולר גולד* — כתוב: *טרוקולר* או *truecaller*
8. *ספוטיפיי* — כתוב: *ספוטיפי* או *spotify*
9. *טיקטוק* — כתוב: *טיקטוק* או *tiktok*
10. *אינסטגרם* — כתוב: *אינסטגרם* או *instagram*
11. *טוויטר / X* — כתוב: *טוויטר* או *twitter*
12. *נוווצאפ* — כתוב: *נוווצאפ* או *nowhatsapp*
13. *יוטיוב ריוונסד* — כתוב: *ריוונסד* או *youtube revanced*
14. *אמזון פריים וידאו* — כתוב: *אמזון פריים* או *amazon prime*
15. *פיקסארט גולד* — כתוב: *פיקסארט* או *picsart*
16. *אליית מושן* — כתוב: *אלייט מושן* או *alight motion*`;

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
