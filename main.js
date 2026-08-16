import http from "http";
import makeWASocket, {
  DisconnectReason,
  fetchLatestWaWebVersion,
  Browsers,
  initAuthCreds,
  BufferJSON,
  proto
} from "@whiskeysockets/baileys";
import QRCode from "qrcode";
import pg from "pg";
import pino from "pino";

// ========================================
// Commands
// ========================================
import startCommand from "./commands/start.js";
import riderCommand from "./commands/rider.js";

const { Pool } = pg;

// ========================================
// Configuration
// ========================================
const PORT = Number(process.env.PORT || 10000);
const TARGET_GROUP_NAME = "פרוץ בווצאפ";
const TARGET_GROUP_JID = "120363410444900210@g.us";

// ========================================
// Commands Map (תמיכה מובנית בטריגרים וכינויים)
// ========================================
const commands = new Map();

function registerCommand(cmd) {
  if (!cmd || !cmd.trigger) return;
  
  // רישום הטריגר הבסיסי (למשל "rider")
  commands.set(cmd.trigger, cmd);
  
  // רישום הצירוף עם סלאש (למשל "/rider")
  if (!cmd.trigger.startsWith("/")) {
    commands.set(`/${cmd.trigger}`, cmd);
  } else {
    commands.set(cmd.trigger.slice(1), cmd);
  }

  // רישום אליאסים נוספים במידה וקיימים
  if (Array.isArray(cmd.aliases)) {
    cmd.aliases.forEach((alias) => commands.set(alias, cmd));
  }
}

registerCommand(startCommand);
registerCommand(riderCommand);

console.log("פקודות נטענו:", [...new Set(commands.keys())].join(", "));

// ========================================
// Neon PostgreSQL Setup
// ========================================
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on("error", (error) => {
  console.error("PostgreSQL pool error:", error);
});

// ========================================
// Database initialization
// ========================================
async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_auth (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    )
  `);
  console.log("Neon database ready ✅");
}

// ========================================
// PostgreSQL Auth State
// ========================================
async function usePostgresAuthState() {
  const readData = async (id) => {
    const result = await pool.query(
      "SELECT data FROM whatsapp_auth WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) return null;
    return JSON.parse(JSON.stringify(result.rows[0].data), BufferJSON.reviver);
  };

  const writeData = async (id, data) => {
    const json = JSON.stringify(data, BufferJSON.replacer);
    await pool.query(
      `INSERT INTO whatsapp_auth (id, data)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [id, json]
    );
  };

  let creds = await readData("creds");
  if (!creds) {
    console.log("אין Auth קיים — יוצר התחברות חדשה...");
    creds = initAuthCreds();
    await writeData("creds", creds);
  }

  const keys = {
    get: async (type, ids) => {
      if (!ids.length) return {};
      const keysToFetch = ids.map((id) => `key-${type}-${id}`);

      const result = await pool.query(
        "SELECT id, data FROM whatsapp_auth WHERE id = ANY($1)",
        [keysToFetch]
      );

      const resultMap = new Map(
        result.rows.map((row) => [
          row.id,
          JSON.parse(JSON.stringify(row.data), BufferJSON.reviver)
        ])
      );

      const data = {};
      for (const id of ids) {
        const key = `key-${type}-${id}`;
        const value = resultMap.get(key) || null;

        if (!value) {
          data[id] = null;
        } else if (type === "app-state-sync-key") {
          data[id] = proto.Message.AppStateSyncKeyData.fromObject(value);
        } else {
          data[id] = value;
        }
      }
      return data;
    },

    set: async (data) => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const category of Object.keys(data)) {
          for (const id of Object.keys(data[category])) {
            const value = data[category][id];
            const key = `key-${category}-${id}`;

            if (value) {
              const json = JSON.stringify(value, BufferJSON.replacer);
              await client.query(
                `INSERT INTO whatsapp_auth (id, data)
                 VALUES ($1, $2::jsonb)
                 ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
                [key, json]
              );
            } else {
              await client.query("DELETE FROM whatsapp_auth WHERE id = $1", [key]);
            }
          }
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }
  };

  return {
    state: { creds, keys },
    saveCreds: async () => {
      await writeData("creds", creds);
    }
  };
}

// ========================================
// WhatsApp State & Cleanup
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
      // להתעלם משגיאות לסגירה נקייה
    }
    sock = null;
  }
}

// ========================================
// Start WhatsApp
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
      const result = await fetchLatestWaWebVersion();
      version = result.version;
      console.log(`WhatsApp Web Version: ${version.join(".")}`);
    } catch (error) {
      console.warn("לא הצלחנו לקבל גרסת WhatsApp Web:", error?.message || error);
      version = undefined;
    }

    const socketConfig = {
      auth: state,
      logger: pino({ level: "silent" }),
      browser: Browsers.ubuntu("Chrome"),
      printQRInTerminal: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      syncFullHistory: false,
      ...(version && { version })
    };

    const newSock = makeWASocket(socketConfig);
    sock = newSock;
    console.log("Socket נוצר בהצלחה.");

    sock.ev.on("creds.update", async () => {
      try {
        await saveCreds();
      } catch (error) {
        console.error("שגיאה בשמירת Auth:", error);
      }
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          currentQR = await QRCode.toDataURL(qr);
          currentStatus = "ממתין לסריקת QR";
          console.log("QR חדש מוכן ב-/qr");
        } catch (error) {
          console.error("שגיאה ביצירת QR:", error);
        }
      }

      if (connection === "connecting") {
        currentStatus = "מתחבר...";
        console.log("מתחבר ל-WhatsApp...");
      }

      if (connection === "open") {
        currentQR = null;
        currentStatus = `מחובר ✅ | קבוצה: ${TARGET_GROUP_NAME}`;
        starting = false;
        console.log("========================================");
        console.log("WhatsApp מחובר! ✅");
        console.log(`קבוצת יעד: ${TARGET_GROUP_NAME}`);
        console.log(`JID: ${TARGET_GROUP_JID}`);
        console.log("========================================");
      }

      if (connection === "close") {
        currentQR = null;
        currentStatus = "מנותק";
        starting = false;

        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log(`WhatsApp התנתק. קוד: ${statusCode}`);

        cleanupSocket();

        if (statusCode === DisconnectReason.loggedOut) {
          currentStatus = "התנתק לצמיתות — יש לחבר מחדש";
          console.log("WhatsApp נותק לצמיתות.");
          return;
        }

        if (reconnectTimer) clearTimeout(reconnectTimer);
        const delay = statusCode === DisconnectReason.restartRequired ? 1000 : 5000;
        console.log(`מנסה להתחבר מחדש בעוד ${delay / 1000} שניות...`);

        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          startWhatsApp();
        }, delay);
      }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
      try {
        if (!messages || messages.length === 0) return;

        for (const message of messages) {
          if (!message?.message) continue;

          // 1. סינון לפי JID הקבוצה (התעלמות שקטה מהודעות חיצוניות)
          const remoteJid = message.key?.remoteJid;
          if (remoteJid !== TARGET_GROUP_JID) {
            continue;
          }

          // 2. התעלמות מהודעות שהבוט מניב בעצמו
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

          const commandText = text.trim();
          const command = commands.get(commandText);

          if (!command) {
            console.log(`[No Match] No command matches string: "${commandText}"`);
            continue;
          }

          console.log(`[Executing] Trigger: ${command.trigger}`);
          try {
            await command.execute(sock, message);
            console.log(`[Success] Command ${command.trigger} executed ✅`);
          } catch (error) {
            console.error(`[Error] Failed executing command ${command.trigger}:`, error);
          }
        }
      } catch (error) {
        console.error("שגיאה בעיבוד הודעה:", error);
      }
    });
  } catch (error) {
    starting = false;
    cleanupSocket();
    currentStatus = "שגיאה בחיבור";
    console.error("שגיאה בהפעלת WhatsApp:", error);

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
      <html lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WhatsApp Bot</title>
      </head>
      <body>
        <h1>WhatsApp Bot 🤖</h1>
        <p>סטטוס: <strong>${currentStatus}</strong></p>
        <p>קבוצה: <strong>${TARGET_GROUP_NAME}</strong></p>
        <p>JID: <strong>${TARGET_GROUP_JID}</strong></p>
        <p><a href="/qr">פתיחת QR</a></p>
        <p><a href="/health">Health</a></p>
      </body>
      </html>
    `);
  }

  if (req.url === "/qr") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    if (!currentQR) {
      return res.end(`
        <!DOCTYPE html>
        <html lang="he">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="refresh" content="3">
          <title>WhatsApp QR</title>
        </head>
        <body>
          <h2>${currentStatus}</h2>
          <p>אין QR פעיל כרגע. הדף יבדוק שוב בעוד 3 שניות.</p>
        </body>
        </html>
      `);
    }

    return res.end(`
      <!DOCTYPE html>
      <html lang="he">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>WhatsApp QR</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 30px; }
          img { width: 300px; max-width: 90%; }
        </style>
      </head>
      <body>
        <h2>סרוק את ה-QR עם WhatsApp 📱</h2>
        <img src="${currentQR}" alt="WhatsApp QR Code">
        <p>לאחר הסריקה אפשר לרענן.</p>
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
  res.end("Not found");
});

// ========================================
// Start HTTP Server & App
// ========================================
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

async function main() {
  try {
    await initDatabase();
    await startWhatsApp();
  } catch (error) {
    console.error("שגיאה בהפעלת המערכת:", error);
  }
}

// ========================================
// Keep Alive (Self-Ping)
// ========================================
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || "https://whatsapp-bot-m6bc.onrender.com";

function sendPing() {
  http.get(`${RENDER_EXTERNAL_URL}/health`, (res) => {
    console.log(`[Keep-Alive] Ping sent to /health — Status: ${res.statusCode}`);
  }).on("error", (err) => {
    console.error("[Keep-Alive] Ping failed:", err.message);
  });
}

// פינג ראשוני מיד בעליית השרת, ולאחר מכן כל 10 דקות
sendPing();
setInterval(sendPing, 10 * 60 * 1000);

main();
