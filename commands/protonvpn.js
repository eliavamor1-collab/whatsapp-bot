let savedMessage = null;

export default {
  trigger: "proton vpn",
  aliases: ["protonvpn", "פרוטון", "vpn"],

  getCaptionText() {
    return `📱 *שם האפליקציה:*
*Proton VPN*
🔢 *גירסא:* v5.20.8.0
📦 *גודל:* ~50 MB
💾 *סוג:* VPN ואבטחה
🎯 *תוכן:*
VPN פרימיום מהמאובטחים בעולם — גולשים אנונימית, עוקפים חסימות, ומגנים על הפרטיות. מהירות גבוהה בלי מגבלות.

ℹ️ *הערות:*
פרימיום פרוץ — כל השרתים פתוחים`;
  },

  async execute(sock, message) {
    const jid = message.key.remoteJid;

    console.log("🚀 פקודת protonvpn הופעלה!");

    const captionText =
`📱 *שם האפליקציה:*
*Proton VPN*
🔢 *גירסא:* v5.20.8.0
📦 *גודל:* ~50 MB
💾 *סוג:* VPN ואבטחה
🎯 *תוכן:*
VPN פרימיום מהמאובטחים בעולם — גולשים אנונימית, עוקפים חסימות, ומגנים על הפרטיות. מהירות גבוהה בלי מגבלות.

ℹ️ *הערות:*
פרימיום פרוץ — כל השרתים פתוחים

━━━━━━━━━━━━━━━
⬇️ *לחץ להורדה ישירה* ⬇️
https://9mod.com/proton-vpn.html
━━━━━━━━━━━━━━━`;

    try {
      if (savedMessage) {
        await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
      } else {
        const sentMsg = await sock.sendMessage(
          jid,
          {
            image: { url: "https://play-lh.googleusercontent.com/BnAMFKXNi3rOOaS4AJYaS-C2zB7v2L8V3P1t3G1VgJz9IFM_bJEIuPZ1bFxOFoWVPk" },
            caption: captionText
          },
          { quoted: message }
        );
        if (sentMsg) savedMessage = sentMsg;
      }
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת protonvpn:", error);
      await sock.sendMessage(jid, { text: captionText }, { quoted: message });
    }
  }
};
