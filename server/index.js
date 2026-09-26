require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const axios = require('axios');
const { checkForUpdates } = require('./scraper');
const { initFirebase } = require('./firebase');
const db = require('./database');

const app = express();
app.use(express.json());

// Initialize Firebase Admin SDK
initFirebase();

// Initialize database (async)
(async () => {
  await db.init();

  // Start server after DB is ready
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Version Tracker server running on port ${PORT}`);
    console.log(`Checking for updates every: ${cronSchedule}`);

    // ============ SELF-PING (keeps Render free tier awake) ============
    const RENDER_URL = process.env.RENDER_URL;
    if (RENDER_URL) {
      setInterval(async () => {
        try {
          await axios.get(`${RENDER_URL}/health`);
          console.log(`[${new Date().toISOString()}] Self-ping OK`);
        } catch (err) {
          console.error('Self-ping failed:', err.message);
        }
      }, 12 * 60 * 1000);
      console.log(`Self-ping enabled: pinging ${RENDER_URL} every 12 minutes`);
    } else {
      console.log('No RENDER_URL set — self-ping disabled (set it for Render deployment)');
    }

    // Run an initial scan on startup so data is available immediately
    // (Render's filesystem resets on each deploy, so we repopulate right away)
    console.log('Running initial version scan on startup...');
    scanRunning = true;
    checkForUpdates()
      .then((updates) => {
        console.log(`Initial scan complete. ${updates.length} update(s) found.`);
      })
      .catch((err) => {
        console.error('Initial scan failed:', err.message);
      })
      .finally(() => {
        scanRunning = false;
      });
  });
})();

// ============ API ROUTES ============

// Register device FCM token
app.post('/api/register', async (req, res) => {
  const { fcmToken, deviceId } = req.body;
  if (!fcmToken || !deviceId) {
    return res.status(400).json({ error: 'fcmToken and deviceId are required' });
  }
  try {
    await db.registerDevice(deviceId, fcmToken);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Subscribe to an app
app.post('/api/subscribe', async (req, res) => {
  const { deviceId, appSlug } = req.body;
  if (!deviceId || !appSlug) {
    return res.status(400).json({ error: 'deviceId and appSlug are required' });
  }
  try {
    await db.subscribe(deviceId, appSlug);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unsubscribe from an app
app.post('/api/unsubscribe', async (req, res) => {
  const { deviceId, appSlug } = req.body;
  if (!deviceId || !appSlug) {
    return res.status(400).json({ error: 'deviceId and appSlug are required' });
  }
  try {
    await db.unsubscribe(deviceId, appSlug);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user subscriptions
app.get('/api/subscriptions/:deviceId', async (req, res) => {
  try {
    const subs = await db.getSubscriptions(req.params.deviceId);
    res.json({ subscriptions: subs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get available apps (catalog)
app.get('/api/apps', async (req, res) => {
  try {
    const apps = await db.getAllApps();
    res.json({ apps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get latest known versions
app.get('/api/versions', async (req, res) => {
  try {
    const versions = await db.getAllVersions();
    res.json({ versions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual trigger for update check (for testing)
app.post('/api/check-updates', async (req, res) => {
  try {
    const updates = await checkForUpdates();
    res.json({ updates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test endpoint — sends a fake update notification to the WhatsApp bot (GET, browser-friendly)
app.get('/api/test-whatsapp', async (req, res) => {
  const axios = require('axios');
  const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'https://whatsapp-bot-plvb.onrender.com';
  try {
    const r = await axios.post(`${WHATSAPP_BOT_URL}/update-notification`, {
      appName: 'בדיקה 🧪',
      oldVersion: '1.0.0',
      newVersion: '2.0.0',
    }, { timeout: 10000 });
    res.json({ success: true, botStatus: r.status, message: 'הודעת בדיקה נשלחה לבוט!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset all versions to null (one-time cleanup after scraper fix)
// Prevents false "update" notifications when versions were previously wrong
app.get('/api/reset-versions', async (req, res) => {
  try {
    await db.resetAllVersions();
    res.json({ success: true, message: 'כל הגרסאות אופסו — הסריקה הבאה תמלא מחדש בלי התראות' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// מחיקת אפליקציה לפי slug מה-DB
app.delete('/api/apps/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    await db.deleteApp(slug);
    res.json({ success: true, message: `${slug} נמחק מה-DB` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// הוספת אפליקציה חדשה ל-DB
app.post('/api/apps', async (req, res) => {
  try {
    const { slug, name } = req.body;
    if (!slug || !name) return res.status(400).json({ error: 'slug and name required' });
    await db.addApp(slug, name);
    res.json({ success: true, message: `${slug} נוסף ל-DB` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint (for self-ping and Render)
app.get('/health', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// ============ CRON JOB ============

const cronSchedule = process.env.CRON_SCHEDULE || '*/2 * * * *';

// מונע חפיפה בין סבבים — אם סבב עדיין רץ, מדלגים על ההרצה הבאה
let scanRunning = false;

cron.schedule(cronSchedule, async () => {
  if (scanRunning) {
    console.log(`[${new Date().toISOString()}] Scan still running — skipping this cycle.`);
    return;
  }
  scanRunning = true;
  console.log(`[${new Date().toISOString()}] Running scheduled version check...`);
  try {
    const updates = await checkForUpdates();
    if (updates.length > 0) {
      console.log(`Found ${updates.length} update(s):`, updates.map(u => `${u.appName}: ${u.oldVersion} → ${u.newVersion}`));
    } else {
      console.log('No updates found.');
    }
  } catch (err) {
    console.error('Error during scheduled check:', err.message);
  } finally {
    scanRunning = false;
  }
});
