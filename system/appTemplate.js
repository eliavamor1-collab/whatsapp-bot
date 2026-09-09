import { sendSuspended } from "./suspended.js";

// ========================================
// תבנית אחידה לכל האפליקציות
// ========================================
// כל אפליקציה מגדירה רק ערכים (שם, גרסה, גודל, תיאור, קישור, תמונה)
// וכל הלוגיקה (בניית טקסט, שליחת תמונה, השעיה, טיפול בשגיאות) מרוכזת כאן.
//
// שדות נתמכים:
//   trigger   (חובה)  — מילת ההפעלה הראשית, למשל "netflix"
//   aliases   (רשות)  — מערך כינויים, למשל ["נטפליקס"]
//   name      (חובה)  — שם האפליקציה המוצג, למשל "Netflix"
//   version   (רשות)  — גרסה, למשל "v8.0"
//   size      (רשות)  — גודל, למשל "50 MB"
//   type      (רשות)  — סוג, למשל "סטרימינג סרטים"
//   content   (חובה)  — תיאור התוכן
//   notes     (רשות)  — הערות (ברירת מחדל: "פשוט להתקין ולהשתמש")
//   image     (רשות)  — קישור לתמונת האפליקציה
//   links     (רשות)  — מערך קישורי הורדה. כל פריט: { label, url } או מחרוזת url
//   fileUrl   (רשות)  — קישור ישיר ל-APK (GitHub Releases) לשליחה כמסמך
//   fileName  (רשות)  — שם הקובץ שיישלח
//   suspended (רשות)  — true אם האפליקציה בהשעיה זמנית
// ========================================

function buildInfoText(app) {
  const lines = [];
  lines.push("📱 *שם האפליקציה:*");
  lines.push(`*${app.name}*`);
  if (app.version) lines.push(`🔢 *גירסא:* ${app.version}`);
  if (app.size) lines.push(`📦 *גודל:* ${app.size}`);
  if (app.type) lines.push(`💾 *סוג:* ${app.type}`);
  lines.push("🎯 *תוכן:*");
  lines.push(app.content);
  lines.push("");
  lines.push("ℹ️ *הערות:*");
  lines.push(app.notes || "פשוט להתקין ולהשתמש");
  return lines.join("\n");
}

function buildLinksBlock(app) {
  const links = normalizeLinks(app.links);
  if (links.length === 0) return "";

  const parts = ["━━━━━━━━━━━━━━━"];
  links.forEach((link, index) => {
    const label = link.label || (index === 0 ? "⬇️ *לחץ להורדה ישירה* ⬇️" : "📲 *קישור הורדה נוסף:*");
    parts.push(label);
    parts.push(link.url);
    if (index < links.length - 1) parts.push("");
  });
  parts.push("━━━━━━━━━━━━━━━");
  return parts.join("\n");
}

function normalizeLinks(links) {
  if (!links) return [];
  const arr = Array.isArray(links) ? links : [links];
  return arr
    .map((item) => (typeof item === "string" ? { url: item } : item))
    .filter((item) => item && item.url);
}

// יוצר אובייקט פקודה מלא מתוך הגדרת הערכים
export function createApp(app) {
  if (!app.trigger || !app.name || !app.content) {
    throw new Error(`createApp: חסר שדה חובה (trigger/name/content) עבור "${app.trigger || "?"}"`);
  }

  let savedMessage = null;

  return {
    trigger: app.trigger,
    aliases: app.aliases || [],
    fileUrl: app.fileUrl,
    fileName: app.fileName,
    suspended: Boolean(app.suspended),

    // טקסט נקי בלי קישורים — לשליחה יחד עם קובץ
    getCaptionText() {
      return buildInfoText(app);
    },

    async execute(sock, message) {
      const jid = message.key.remoteJid;
      console.log(`🚀 פקודת ${app.trigger} הופעלה!`);

      // השעיה זמנית
      if (app.suspended) {
        return await sendSuspended(sock, message);
      }

      const infoText = buildInfoText(app);
      const linksBlock = buildLinksBlock(app);
      const captionText = linksBlock ? `${infoText}\n\n${linksBlock}` : infoText;

      try {
        if (savedMessage) {
          console.log(`♻️ משתמש בהודעה שמורה בזיכרון לשליחת ${app.name}...`);
          await sock.sendMessage(jid, { forward: savedMessage }, { quoted: message });
        } else if (app.image) {
          console.log(`📸 שולח תמונת ${app.name} בפעם הראשונה...`);
          const sentMsg = await sock.sendMessage(
            jid,
            { image: { url: app.image }, caption: captionText },
            { quoted: message }
          );
          if (sentMsg) {
            savedMessage = sentMsg;
            console.log(`✅ הודעת ${app.name} הראשונה נשמרה בזיכרון!`);
          }
        } else {
          // אין תמונה — שולחים טקסט בלבד
          await sock.sendMessage(jid, { text: captionText }, { quoted: message });
        }
      } catch (error) {
        console.error(`❌ שגיאה בשליחת הודעת ${app.trigger}:`, error);
        await sock.sendMessage(jid, { text: captionText }, { quoted: message });
      }
    }
  };
}
