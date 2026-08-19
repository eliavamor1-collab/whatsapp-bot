import http from "http";
import makeWASocket, {
  DisconnectReason,
  fetchLatestWaWebVersion,
  Browsers,
  initAuthCreds,
  BufferJSON,
  proto,
  generateWAMessageFromContent,
  isJidGroup
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import pg from "pg";
import pino from "pino";

process.on("uncaughtException", (err) => {
  const msg = err?.message || String(err);
  if (msg.includes("Bad MAC") || msg.includes("Session") || msg.includes("Closing session")) return;
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  const msg = reason?.message || String(reason);
  if (msg.includes("Bad MAC") || msg.includes("Session") || msg.includes("Closing session")) return;
  console.error("Unhandled Rejection:", reason);
});

// ========================================
// Commands Import
// ========================================
import startCommand from "./commands/start.js";
import listCommand from "./commands/list.js";
import riderCommand from "./commands/rider.js";
import robloxCommand from "./commands/roblox.js";
import subwayCommand from "./commands/subwaysurfers.js";
import youtubeCommand from "./commands/youtube.js";
import youtubemusicCommand from "./commands/youtubemusic.js";
import capcutCommand from "./commands/capcut.js";
import truecallerCommand from "./commands/truecaller.js";
import spotifyCommand from "./commands/spotify.js";
import tiktokCommand from "./commands/tiktok.js";
import instagramCommand from "./commands/instagram.js";
import twitterCommand from "./commands/twitter.js";
import nowhatsappCommand from "./commands/nowhatsapp.js";
import youtuberevancedCommand from "./commands/youtuberevanced.js";
import amazonprimeCommand from "./commands/amazonprime.js";
import picsartCommand from "./commands/picsart.js";
import alightmotionCommand from "./commands/alightmotion.js";
import youtubevancedCommand from "./commands/youtubevanced.js";
import lightroomCommand from "./commands/lightroom.js";
import snaptubeCommand from "./commands/snaptube.js";
import disneyCommand from "./commands/disney.js";
import duolingoCommand from "./commands/duolingo.js";
import telegramCommand from "./commands/telegram.js";
import reminiCommand from "./commands/remini.js";
import inshotCommand from "./commands/inshot.js";
import netflixCommand from "./commands/netflix.js";
import mxplayerCommand from "./commands/mxplayer.js";
import flstudioCommand from "./commands/flstudio.js";
import picretouchCommand from "./commands/picretouch.js";
import sportCommand from "./commands/sport.js";
import animefyCommand from "./commands/animefy.js";
import clashRoyaleCommand from "./commands/clashroyale.js";
import randomCommand from "./commands/random.js";
import { containsCurse, handleCurse } from "./commands/cursefilter.js";

const { Pool } = pg;

// ========================================
// Configuration
// ========================================
const PORT = Number(process.env.PORT || 10000);
const TARGET_GROUP_NAME = "פרוץ בווצאפ";
const TARGET_GROUP_JID = "120363410444900210@g.us";
const TARGET_GROUP_NAME_2 = "פרוץ בווצאפ (איחסון)";
const TARGET_GROUP_JID_2 = "120363408996332000@g.us";
const ALLOWED_GROUPS = new Set([TARGET_GROUP_JID, TARGET_GROUP_JID_2]);
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || "https://whatsapp-bot-m6bc.onrender.com";

// ========================================
// Commands Map Registration
// ========================================
const commands = new Map();

function registerCommand(cmd) {
  if (!cmd || !cmd.trigger) return;

  const mainTrigger = cmd.trigger.toLowerCase();
  commands.set(mainTrigger, cmd);

  if (!mainTrigger.startsWith("/")) {
    commands.set(`/${mainTrigger}`, cmd);
  } else {
    commands.set(mainTrigger.slice(1), cmd);
  }

  if (Array.isArray(cmd.aliases)) {
    cmd.aliases.forEach((alias) => {
      const lowerAlias = alias.toLowerCase();
      commands.set(lowerAlias, cmd);
      if (!lowerAlias.startsWith("/")) {
        commands.set(`/${lowerAlias}`, cmd);
      }
    });
  }
}

registerCommand(startCommand);
registerCommand(listCommand);
registerCommand(riderCommand);
registerCommand(robloxCommand);
registerCommand(subwayCommand);
registerCommand(youtubeCommand);
registerCommand(youtubemusicCommand);
registerCommand(capcutCommand);
registerCommand(truecallerCommand);
registerCommand(spotifyCommand);
registerCommand(tiktokCommand);
registerCommand(instagramCommand);
registerCommand(twitterCommand);
registerCommand(nowhatsappCommand);
registerCommand(youtuberevancedCommand);
registerCommand(amazonprimeCommand);
registerCommand(picsartCommand);
registerCommand(alightmotionCommand);
registerCommand(youtubevancedCommand);
registerCommand(lightroomCommand);
registerCommand(snaptubeCommand);
registerCommand(disneyCommand);
registerCommand(duolingoCommand);
registerCommand(telegramCommand);
registerCommand(reminiCommand);
registerCommand(inshotCommand);
registerCommand(netflixCommand);
registerCommand(mxplayerCommand);
registerCommand(flstudioCommand);
registerCommand(picretouchCommand);
registerCommand(sportCommand);
registerCommand(animefyCommand);
registerCommand(clashRoyaleCommand);
registerCommand(randomCommand);

console.log("פקודות נטענו בהצלחה:", [...new Set(commands.keys())].join(", "));

// ========================================
// Neon PostgreSQL Setup
// ========================================
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in environment variables!");
}

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl.includes("sslmode=")) {
  dbUrl += (dbUrl.includes("?") ? "&" : "?") + "sslmode=verify-full";
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on("error", (error) => {
  console.error("PostgreSQL Pool Error:", error);
});

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_auth (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS saved_files (
      app_name TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      remote_jid TEXT NOT NULL,
      raw_message JSONB,
      saved_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log("Neon Database is ready ✅");
}

// ========================================
// File Storage Functions
// ========================================
async function saveFile(appName, messageId, remoteJid, rawMessage) {
  try {
    await pool.query(
      `INSERT INTO saved_files (app_name, message_id, remote_jid, raw_message)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (app_name) DO UPDATE SET message_id = EXCLUDED.message_id, remote_jid = EXCLUDED.remote_jid, raw_message = EXCLUDED.raw_message, saved_at = NOW()`,
      [appName.toLowerCase().trim(), messageId, remoteJid, JSON.stringify(rawMessage)]
    );
    console.log(`✅ קובץ נשמר: ${appName} → ${messageId}`);
    return true;
  } catch (err) {
    console.error("❌ שגיאה בשמירת קובץ:", err);
    return false;
  }
}

async function getFile(appName) {
  try {
    const result = await pool.query(
      "SELECT message_id, remote_jid, raw_message FROM saved_files WHERE app_name = $1",
      [appName.toLowerCase().trim()]
    );
    if (result.rows.length === 0) return null;
    return result.rows[0];
  } catch (err) {
    console.error("❌ שגיאה בשליפת קובץ:", err);
    return null;
  }
}

// ========================================
// PostgreSQL Auth State Strategy
// ========================================
async function usePostgresAuthState() {
  const readData = async (id) => {
    try {
      const result = await pool.query("SELECT data FROM whatsapp_auth WHERE id = $1", [id]);
      if (result.rows.length === 0) return null;
      return JSON.parse(JSON.stringify(result.rows[0].data), BufferJSON.reviver);
    } catch (err) {
      console.error(`Error reading key ${id} from DB:`, err);
      return null;
    }
  };

  const writeData = async (id, data) => {
    try {
      const json = JSON.stringify(data, BufferJSON.replacer);
      await pool.query(
        `INSERT INTO whatsapp_auth (id, data)
         VALUES ($1, $2::jsonb)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
        [id, json]
      );
    } catch (err) {
      console.error(`Error writing key ${id} to DB:`, err);
    }
  };

  const deleteData = async (id) => {
    try {
      await pool.query("DELETE FROM whatsapp_auth WHERE id = $1", [id]);
    } catch (err) {
      console.error(`Error deleting key ${id} from DB:`, err);
    }
  };

  let creds = await readData("creds");
  if (!creds) {
    console.log("אין סשן קיים — יוצר התחברות חדשה...");
    creds = initAuthCreds();
    await writeData("creds", creds);
  }

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`key-${type}-${id}`);
              if (type === "app-state-sync-key" && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const value = data[category][id];
              const key = `key-${category}-${id}`;
              if (value) {
                tasks.push(writeData(key, value));
              } else {
                tasks.push(deleteData(key));
              }
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: async () => {
      await writeData("creds", creds);
    }
  };
}

// ========================================
// Global State & Cleanups
// ========================================
let currentQR = null;
let currentStatus = "מתחבר...";
let sock = null;
let reconnectTimer = null;
let starting = false;
const botSentMessageIds = new Set();

function cleanupSocket() {
  if (sock) {
    try {
      sock.ev.removeAllListeners();
      sock.ws?.close();
      sock.end(undefined);
    } catch (e) {
      // Ignore cleanup errors
    }
    sock = null;
  }
}

// ========================================
// Main WhatsApp Engine
// ========================================
async function startWhatsApp() {
  if (starting) {
    console.log("WhatsApp כבר בתהליך התחברות...");
    return;
  }
  starting = true;

  cleanupSocket();

  try {
    console.log("טוען WhatsApp Auth מ-Neon...");
    const { state, saveCreds } = await usePostgresAuthState();

    console.log("בודק גרסת WhatsApp Web...");
    let version;
    try {
      const result = await fetchLatestWaWebVersion({});
      version = result.version;
      console.log(`WhatsApp Web Version: ${version.join(".")}`);
    } catch (error) {
      console.warn("לא הצלחנו לקבל גרסת WhatsApp Web, משתמש בברירת מחדל:", error?.message || error);
    }

    // רמת הלוג מוגדרת ל-fatal בלבד למניעת הודעות שגיאה מיותרות בלוג
    const logger = pino({ level: "fatal" });

    const socketConfig = {
      auth: state,
      logger,
      browser: Browsers.ubuntu("Chrome"),
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: undefined,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      shouldIgnoreJid: (jid) => jid?.endsWith("@broadcast"),
      getMessage: async (key) => {
        return { conversation: "" };
      },
      ...(version && { version })
    };

    sock = makeWASocket(socketConfig);
    console.log("Socket נוצר בהצלחה.");

    sock.ev.on("creds.update", async () => {
      try {
        await saveCreds();
      } catch (error) {
        console.error("שגיאה בשמירת Auth Creds:", error);
      }
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          currentQR = await QRCode.toDataURL(qr);
          currentStatus = "ממתין לסריקת QR";
          console.log("QR חדש זמין לצפייה ב-/qr");
        } catch (error) {
          console.error("שגיאה ביצירת QR Code:", error);
        }
      }

      if (connection === "connecting") {
        currentStatus = "מתחבר...";
        console.log("מתחבר לשרתי WhatsApp...");
      }

      if (connection === "open") {
        currentQR = null;
        currentStatus = `מחובר ✅ | קבוצות: ${TARGET_GROUP_NAME} | ${TARGET_GROUP_NAME_2}`;
        starting = false;
        console.log("========================================");
        console.log("WhatsApp מחובר בהצלחה! ✅");
        console.log(`קבוצת יעד: ${TARGET_GROUP_NAME}`);
        console.log(`JID יעד: ${TARGET_GROUP_JID}`);
        console.log("========================================");
      }

      if (connection === "close") {
        currentQR = null;
        currentStatus = "מנותק";
        starting = false;

        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log(`WhatsApp התנתק. קוד שגיאה: ${statusCode}`);

        cleanupSocket();

        if (statusCode === DisconnectReason.loggedOut) {
          currentStatus = "התנתק לצמיתות — נדרשת סריקה מחדש";
          console.log("החשבון נותק מ-WhatsApp (Logged Out).");
          return;
        }

        if (statusCode === 440 || statusCode === DisconnectReason.connectionReplaced) {
          currentStatus = "קונפליקט חיבורים (קוד 440)";
          console.error("⚠️ קונפליקט חיבורים: נעצרה התחברות מחודשת כדי למנוע לופים.");
          return;
        }

        if (reconnectTimer) clearTimeout(reconnectTimer);
        const delay = statusCode === DisconnectReason.restartRequired ? 2000 : 5000;
        console.log(`מנסה להתחבר מחדש בעוד ${delay / 1000} שניות...`);

        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          startWhatsApp();
        }, delay);
      }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      try {
        if (type !== "notify" || !messages || messages.length === 0) return;

        for (const message of messages) {
          if (!message?.message) continue;

          const remoteJid = message.key?.remoteJid;
          if (!ALLOWED_GROUPS.has(remoteJid)) continue;

          const messageId = message.key?.id;
          if (messageId && botSentMessageIds.has(messageId)) {
            botSentMessageIds.delete(messageId);
            continue;
          }

          const msgContent = message.message;
          const text =
            msgContent?.conversation ||
            msgContent?.extendedTextMessage?.text ||
            msgContent?.imageMessage?.caption ||
            msgContent?.videoMessage?.caption ||
            "";

          if (!text) continue;

          console.log(`[Message Received] JID: ${remoteJid} | Text: "${text}" | FromMe: ${Boolean(message.key?.fromMe)}`);

          const trimmedText = text.trim().toLowerCase();

          // ========================================
          // זיהוי reply עם "שמור" — שמירת קובץ
          // ========================================
          const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          const quotedMsgId = message.message?.extendedTextMessage?.contextInfo?.stanzaId;
          const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

          if (trimmedText.startsWith("שמור ") && quotedMsg && quotedMsgId) {
            const appName = trimmedText.replace("שמור ", "").trim();
            if (appName.length === 0) {
              await sock.sendMessage(remoteJid, { text: "❌ כתוב שם אפליקציה אחרי שמור, למשל: שמור רובלוקס" }, { quoted: message });
              continue;
            }
            const saved = await saveFile(appName, quotedMsgId, remoteJid, quotedMsg);
            if (saved) {
              await sock.sendMessage(remoteJid, { text: `✅ הקובץ נשמר בהצלחה תחת השם: *${appName}*` }, { quoted: message });
            } else {
              await sock.sendMessage(remoteJid, { text: "❌ שגיאה בשמירת הקובץ, נסה שוב" }, { quoted: message });
            }
            continue;
          }

          // ========================================
          // רשימת קבצים שמורים
          // ========================================
          if (trimmedText === "רשימת קבצים") {
            try {
              const result = await pool.query("SELECT app_name, saved_at FROM saved_files ORDER BY saved_at DESC");
              if (result.rows.length === 0) {
                await sock.sendMessage(remoteJid, { text: "📂 אין קבצים שמורים עדיין" }, { quoted: message });
              } else {
                const lines = result.rows.map((r, i) => `${i + 1}. *${r.app_name}* — נשמר: ${new Date(r.saved_at).toLocaleDateString("he-IL")}`);
                await sock.sendMessage(remoteJid, { text: `📂 *קבצים שמורים:*\n\n${lines.join("\n")}\n\nכדי לקבל קובץ: כתוב שם האפליקציה + *קובץ*\nכדי למחוק: כתוב שם האפליקציה + *מחק*` }, { quoted: message });
              }
            } catch (err) {
              console.error("❌ שגיאה בשליפת רשימת קבצים:", err);
            }
            continue;
          }

          // ========================================
          // מחיקת קובץ שמור
          // ========================================
          if (trimmedText.endsWith(" מחק")) {
            const appName = trimmedText.replace(/ מחק$/, "").trim();
            try {
              const result = await pool.query("DELETE FROM saved_files WHERE app_name = $1 RETURNING app_name", [appName]);
              if (result.rows.length > 0) {
                await sock.sendMessage(remoteJid, { text: `🗑️ הקובץ *${appName}* נמחק בהצלחה` }, { quoted: message });
              } else {
                await sock.sendMessage(remoteJid, { text: `❌ לא נמצא קובץ בשם *${appName}*` }, { quoted: message });
              }
            } catch (err) {
              console.error("❌ שגיאה במחיקת קובץ:", err);
            }
            continue;
          }

          // בדיקת קללות — לפני כל פקודה
          if (containsCurse(text) && !message.key?.fromMe) {
            await handleCurse(sock, message);
            continue;
          }

          let command = commands.get(trimmedText);

          if (!command) {
            const firstWord = trimmedText.split(/\s+/)[0];
            command = commands.get(firstWord);
          }

          // חיפוש בתוך המשפט — אם עדיין לא נמצאה פקודה
          if (!command) {
            // ממיינים את המפתחות מהארוך לקצר כדי לתת עדיפות לביטויים ארוכים יותר
            const sortedKeys = [...commands.keys()].sort((a, b) => b.length - a.length);
            for (const key of sortedKeys) {
              if (trimmedText.includes(key)) {
                command = commands.get(key);
                console.log(`[Partial Match] נמצאה פקודה "${key}" בתוך המשפט: "${trimmedText}"`);
                break;
              }
            }
          }

          // בדיקת יוטיוב — אם כתבו רק "יוטיוב" או "youtube" בלי לציין סוג
          if (!command && (trimmedText === "יוטיוב" || trimmedText === "youtube")) {
            await sock.sendMessage(
              remoteJid,
              {
                text: `איזה יוטיוב אתה רוצה? 🎬\n\n▶️ *יוטיוב מורפ* — כתוב: *יוטיוב מורפ* או *youtube morphe*\n🔄 *יוטיוב ריוונסד* — כתוב: *יוטיוב ריוונסד* או *youtube revanced*\n⚡ *יוטיוב ונסד* — כתוב: *יוטיוב ונסד* או *youtube vanced*`
              },
              { quoted: message }
            );
            continue;
          }

          if (!command) {
            console.log(`[No Match] No command found for trigger: "${trimmedText}"`);
            continue;
          }

          console.log(`[Executing] Executing trigger: ${command.trigger}`);
          try {
            // בדיקה אם המשתמש ביקש קובץ
            const wantsFile = trimmedText.includes("קובץ");

            if (wantsFile) {
              // מחפשים קובץ שמור — קודם לפי trigger, אחר כך לפי aliases
              const namesToTry = [command.trigger, ...(command.aliases || [])];
              let fileData = null;
              let foundName = null;
              for (const name of namesToTry) {
                fileData = await getFile(name);
                if (fileData) { foundName = name; break; }
              }

              if (fileData) {
                // שולחים רק את הקובץ — בלי טקסט/תמונה
                try {
                  await sock.copyNForward(
                    remoteJid,
                    {
                      key: {
                        remoteJid: fileData.remote_jid,
                        id: fileData.message_id,
                        fromMe: false
                      },
                      message: fileData.raw_message
                    },
                    false
                  );
                  console.log(`[File] קובץ נשלח עבור ${command.trigger} ✅`);
                } catch (fwdErr) {
                  console.error("❌ שגיאה בהעברת קובץ:", fwdErr);
                  await sock.sendMessage(remoteJid, { text: "❌ שגיאה בהעברת הקובץ, נסה שוב" }, { quoted: message });
                }
              } else {
                // אין קובץ שמור — שולחים רק הודעת שגיאה
                await sock.sendMessage(
                  remoteJid,
                  { text: `⚠️ אין קובץ שמור עבור *${command.trigger}*` },
                  { quoted: message }
                );
              }
            } else {
              // בקשה רגילה בלי קובץ
              if (command.trigger === "random") {
                await command.execute(sock, message, commands);
              } else {
                await command.execute(sock, message);
              }
            }
            console.log(`[Success] Command "${command.trigger}" executed successfully ✅`);
          } catch (error) {
            console.error(`[Error] Failed executing command "${command.trigger}":`, error);
          }
        }
      } catch (error) {
        console.error("שגיאה בעיבוד הודעות נכנסות:", error);
      }
    });
  } catch (error) {
    starting = false;
    cleanupSocket();
    currentStatus = "שגיאה בחיבור";
    console.error("שגיאה קריטית בהפעלת WhatsApp:", error);

    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      startWhatsApp();
    }, 10000);
  }
}

// ========================================
// HTTP Server
// ========================================
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(`
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WhatsApp Bot Dashboard</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; background: #f4f4f9; color: #333; }
          .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); max-width: 500px; margin: auto; }
          a { color: #007bff; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>WhatsApp Bot 🤖</h1>
          <p>סטטוס: <strong>${currentStatus}</strong></p>
          <p>קבוצה 1: <strong>${TARGET_GROUP_NAME}</strong></p>
          <p>קבוצה 2: <strong>${TARGET_GROUP_NAME_2}</strong></p>
          <p>JID: <code>${TARGET_GROUP_JID}</code></p>
          <hr />
          <p><a href="/qr">📱 הצג QR להתחברות</a></p>
          <p><a href="/health">❤️ בדיקת Health</a></p>
        </div>
      </body>
      </html>
    `);
  }

  if (req.url === "/qr") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (!currentQR) {
      return res.end(`
        <!DOCTYPE html>
        <html lang="he" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="3">
          <title>WhatsApp QR</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 3rem; }
          </style>
        </head>
        <body>
          <h2>${currentStatus}</h2>
          <p>אין QR זמין לריענון כרגע. הדף יתרענן אוטומטית...</p>
        </body>
        </html>
      `);
    }

    return res.end(`
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WhatsApp QR</title>
        <style>
          body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
          img { width: 300px; max-width: 90%; border: 1px solid #ccc; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h2>סרוק את ה-QR Code באמצעות WhatsApp 📱</h2>
        <img src="${currentQR}" alt="WhatsApp QR Code">
        <p>רענן את הדף לאחר הסריקה.</p>
      </body>
      </html>
    `);
  }

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(
      JSON.stringify({
        status: currentStatus,
        whatsapp: Boolean(sock),
        targetGroup: TARGET_GROUP_NAME,
        targetGroupJid: TARGET_GROUP_JID,
        connected: Boolean(sock && currentStatus.includes("מחובר"))
      })
    );
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

// ========================================
// Keep Alive Ping Mechanism
// ========================================
async function sendPing() {
  try {
    const res = await fetch(`${RENDER_EXTERNAL_URL}/health`);
    console.log(`[Keep-Alive] Ping sent to /health — Status: ${res.status}`);
  } catch (err) {
    console.error("[Keep-Alive] Ping failed:", err.message);
  }
}

// ========================================
// Application Lifecycle
// ========================================
server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP Server running on port ${PORT}`);
});

async function main() {
  try {
    await initDatabase();
    await startWhatsApp();

    sendPing();
    setInterval(sendPing, 10 * 60 * 1000);
  } catch (error) {
    console.error("שגיאה קריטית בעליית השרת:", error);
  }
}

main();
