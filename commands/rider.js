import { generateWAMessageFromContent, proto } from "@whiskeysockets/baileys";
import axios from "axios";

export default {
  trigger: "rider",
  aliases: ["/rider"],

  async execute(sock, message) {
    console.log("🚀 RIDER EXECUTE הופעל!");

    const jid = message.key.remoteJid;
    const downloadUrl = "https://liteapks.com/download/rider-14435/1";
    // התמונה החדשה של TierMaker
    const imageUrl = "https://tiermaker.com/images/templates/rider-ketchapp-game-obstacle-tier-list-273305/2733051675445032.png";

    const bodyText = 
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

    try {
      // הורדת התמונה החדשה ל-Buffer והעלאה מראש ל-WhatsApp
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      const imageBuffer = Buffer.from(response.data, "binary");
      const preparedImage = await sock.sendMessage(jid, { image: imageBuffer });

      // בניית הודעת Native Flow אינטראקטיבית עם כפתור קישור
      const msg = generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.create({
                header: proto.Message.InteractiveMessage.Header.create({
                  hasMediaAttachment: true,
                  imageMessage: preparedImage.message.imageMessage
                }),
                body: proto.Message.InteractiveMessage.Body.create({
                  text: bodyText
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: "לחץ למטה להורדה"
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "📥 הורד את המשחק",
                        url: downloadUrl
                      })
                    }
                  ]
                })
              })
            }
          }
        },
        { quoted: message }
      );

      await sock.relayMessage(jid, msg.message, { messageId: msg.key.id });
      console.log("✅ הודעת Rider נשלחה בהצלחה!");

    } catch (err) {
      console.error("❌ שגיאה בשליחה אינטראקטיבית, מפעיל גיבוי:", err);

      try {
        await sock.sendMessage(
          jid,
          {
            image: { url: imageUrl },
            caption: `${bodyText}\n\n📲 *קישור להורדה:* ${downloadUrl}`
          },
          { quoted: message }
        );
      } catch (fallbackErr) {
        console.error("❌ שגיאה בגיבוי תמונה, שולח טקסט בלבד:", fallbackErr);
        await sock.sendMessage(
          jid,
          { text: `${bodyText}\n\n📲 *קישור להורדה:* ${downloadUrl}` },
          { quoted: message }
        );
      }
    }
  }
};
