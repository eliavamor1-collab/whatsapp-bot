export const SUSPENDED_MESSAGE =
`🚧 *האפליקציה בהשעייה זמנית* 🚧

⚙️ האפליקציה נמצאת כרגע בהשעייה זמנית עקב עדכונים ותיקונים.

🔄 האפליקציה תחזור לבוט בהקדם האפשרי.

⏳ *תודה על הסבלנות!*`;

export async function sendSuspended(sock, message) {
  const jid = message.key.remoteJid;
  await sock.sendMessage(
    jid,
    { text: SUSPENDED_MESSAGE },
    { quoted: message }
  );
}
