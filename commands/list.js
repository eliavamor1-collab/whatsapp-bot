export default {
  trigger: "list",
  aliases: ["רשימה"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת list הופעלה!");

    const listText =
`📋 *רשימת האפליקציות והמשחקים הזמינים:*

1. *אינסטגרם* — כתוב:
*אינסטגרם* או *instagram*
2. *אליית מושן* — כתוב:
*אלייט מושן* או *alight motion*
3. *אמזון פריים וידאו* — כתוב:
*אמזון פריים* או *amazon prime*
4. *טיקטוק* — כתוב:
*טיקטוק* או *tiktok*
5. *טרוקולר גולד* — כתוב:
*טרוקולר* או *truecaller*
6. *טוויטר / X* — כתוב:
*טוויטר* או *twitter*
7. *יוטיוב מורפ* — כתוב:
*יוטיוב* או *youtube*
8. *יוטיוב מיוזיק מורפ* — כתוב:
*יוטיוב מיוזיק* או *youtube music*
9. *יוטיוב ריוונסד* — כתוב:
*ריוונסד* או *youtube revanced*
10. *נוווצאפ* — כתוב:
*נוווצאפ* או *nowhatsapp*
11. *סאבווי סארפרס* — כתוב:
*סאבווי* או *subway*
12. *ספוטיפיי* — כתוב:
*ספוטיפי* או *spotify*
13. *פיקסארט גולד* — כתוב:
*פיקסארט* או *picsart*
14. *קאפקאט* — כתוב:
*קאפקאט* או *capcut*
15. *ריידר* — כתוב:
*ריידר* או *rider*
16. *רובלוקס* — כתוב:
*רובלוקס* או *roblox*`;

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
