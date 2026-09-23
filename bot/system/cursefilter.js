// מעקב אחר מספר אזהרות לכל משתמש
const warnings = new Map();

// רשימת קללות לזיהוי
const CURSE_WORDS = [
  "בן זונה", "בן שרמוטה", "בן כלבה", "בן מניאק",
  "זונה", "שרמוטה", "מניאק", "מניאקית",
  "כוסאמק", "כוס אמק", "כוסעמק", "כוס עמק", "כוסעמאק", "כוסאמאק",
  "אבן זונה", "ממזר", "ממזרת",
  "זיין", "זין", "מזיין", "מזוין", "תזיין", "תזדיין", "לך תזיין", "לך תזדיין",
  "בן זיין", "בן מזויין", "בולבול",
  "יא זונה", "יא שרמוטה", "יא מניאק",
];

// תווים שנחשבים "אות" ולכן חלק ממילה (עברית + אנגלית + ספרות + גרש/גרשיים)
const WORD_CHAR = "[a-zA-Z\\u0590-\\u05FF0-9'\"]";

// בונים לכל קללה regex שמחייב גבול מילה משני הצדדים,
// כדי ש-"זין" לא יזוהה בתוך "מגזין" / "מזין" וכו'
const CURSE_PATTERNS = CURSE_WORDS.map((word) => {
  const escaped = word
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // בריחה מתווים מיוחדים ב-regex
    .replace(/\s+/g, "\\s+");                // רווח = רווח אחד או יותר
  // (?<!אות) לפני, ו-(?!אות) אחרי — כלומר המילה עומדת בפני עצמה
  return new RegExp(`(?<!${WORD_CHAR})${escaped}(?!${WORD_CHAR})`, "i");
});

export function containsCurse(text) {
  if (!text) return false;
  return CURSE_PATTERNS.some((pattern) => pattern.test(text));
}

export async function handleCurse(sock, message) {
  const jid = message.key.remoteJid;
  const sender = message.key.participant || message.key.remoteJid;

  // מספר האזהרות הנוכחי
  const currentWarnings = (warnings.get(sender) || 0) + 1;
  warnings.set(sender, currentWarnings);

  console.log(`⚠️ קללה זוהתה מ-${sender} | אזהרה מספר ${currentWarnings}`);

  try {
    if (currentWarnings === 1) {
      await sock.sendMessage(
        jid,
        {
          text: `@${sender.split("@")[0]} ⚠️ *אזהרה ראשונה!*\nאנא הימנע משימוש בשפה לא הולמת בקבוצה.`,
          mentions: [sender],
        },
        { quoted: message }
      );
    } else if (currentWarnings === 2) {
      await sock.sendMessage(
        jid,
        {
          text: `@${sender.split("@")[0]} ⚠️ *אזהרה שנייה!*\nזוהי אזהרה נוספת — עוד הפרה ותקבל אזהרה אחרונה.`,
          mentions: [sender],
        },
        { quoted: message }
      );
    } else if (currentWarnings === 3) {
      await sock.sendMessage(
        jid,
        {
          text: `@${sender.split("@")[0]} 🚨 *אזהרה אחרונה!*\nזוהי ההזהרה האחרונה שלך — הפרה נוספת תגרום להסרה מהקבוצה!`,
          mentions: [sender],
        },
        { quoted: message }
      );
    } else {
      // אזהרה רביעית — מעיף מהקבוצה
      await sock.sendMessage(
        jid,
        {
          text: `@${sender.split("@")[0]} 🚫 *הוסרת מהקבוצה* בשל שימוש חוזר בשפה לא הולמת.`,
          mentions: [sender],
        },
        { quoted: message }
      );

      // מסיר את המשתמש מהקבוצה
      await sock.groupParticipantsUpdate(jid, [sender], "remove");
      warnings.delete(sender);
      console.log(`🚫 ${sender} הוסר מהקבוצה`);
    }
  } catch (error) {
    console.error("❌ שגיאה בטיפול בקללה:", error);
  }
}
