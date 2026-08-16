export default {
    trigger: "rider",
    aliases: ["/rider"],

    async execute(sock, message) {
        console.log("🚀 RIDER EXECUTE הופעל!");

        const jid = message.key.remoteJid;

        const imageUrl = "https://static-images.aptoide.com/_next/image?url=https%3A%2F%2Fcdn.aptoide.com%2Fimgs%2F6%2F9%2F7%2F69777a504b00c4646a330b3c4d468df2_fgraphic.png&w=3840&q=60";
        const downloadUrl = "https://liteapks.com/download/rider-14435/1";

        const captionText = 
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

        // הגדרת הודעה עם כפתור קישור חיצוני
        const buttonMessage = {
            image: { url: imageUrl },
            caption: captionText,
            footer: "לחץ על הכפתור למטה להורדה ⬇️",
            templateButtons: [
                {
                    index: 1,
                    urlButton: {
                        displayText: "📲 להורדת המשחק",
                        url: downloadUrl
                    }
                }
            ]
        };

        try {
            // ניסיון שליחה עם תמונה וכפתור
            await sock.sendMessage(jid, buttonMessage, { quoted: message });
            console.log("✅ הודעת Rider עם כפתור נשלחה בהצלחה!");
        } catch (error) {
            console.error("❌ שגיאה בשליחת כפתור, שולח בפורמט טקסט רגיל:", error.message);
            
            // Fallback: שליחת הודעה רגילה אם המכשיר/השרת חוסם הודעות כפתורים
            await sock.sendMessage(
                jid,
                {
                    image: { url: imageUrl },
                    caption: `${captionText}\n\n🔗 *קישור להורדה:*\n${downloadUrl}`
                },
                { quoted: message }
            );
        }
    }
};
