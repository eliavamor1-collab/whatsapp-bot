export default {
  trigger: "list",
  aliases: ["רשימה"],

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת list הופעלה!");

    const listText =
`📋 *רשימת האפליקציות והמשחקים הזמינים:*

1. *רובלוקס* — לפקודה כתוב: *רובלוקס* או *roblox*
2. *ריידר* — לפקודה כתוב: *ריידר* או *rider*
3. *סאבווי סארפרס* — לפקודה כתוב: *סאבווי* או *subway*
4. *יוטיוב מורפ* — לפקודה כתוב: *יוטיוב* או *youtube*
5. *יוטיוב מיוזיק מורפ* — לפקודה כתוב: *יוטיוב מיוזיק* או *youtube music*
6. *CapCut* — לפקודה כתוב: *קאפקאט* או *capcut*
7. *Truecaller Gold* — לפקודה כתוב: *טרוקולר* או *truecaller*
8. *Spotify Music* — לפקודה כתוב: *ספוטיפי* או *spotify*
9. *TikTok* — לפקודה כתוב: *טיקטוק* או *tiktok*
10. *Instagram* — לפקודה כתוב: *אינסטגרם* או *instagram*
11. *X (Twitter)* — לפקודה כתוב: *טוויטר* או *twitter*
12. *NOWhatsApp* — לפקודה כתוב: *נוווצאפ* או *nowhatsapp*
13. *YouTube ReVanced* — לפקודה כתוב: *ריוונסד* או *youtube revanced*
14. *Amazon Prime Video* — לפקודה כתוב: *אמזון פריים* או *amazon prime*
15. *Picsart Gold* — לפקודה כתוב: *פיקסארט* או *picsart*
16. *Alight Motion* — לפקודה כתוב: *אלייט מושן* או *alight motion*

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
