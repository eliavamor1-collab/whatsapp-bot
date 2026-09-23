const { Pool } = require('pg');

let pool;

async function init() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in environment variables!');
  }

  let dbUrl = process.env.DATABASE_URL;
  // Remove any sslmode param — we handle SSL via the ssl option below
  dbUrl = dbUrl.replace(/([?&])sslmode=[^&]*/i, '$1').replace(/[?&]$/, '');

  pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => console.error('PostgreSQL Pool Error:', err));

  // Tables (prefixed with mu_ to avoid clashing with the WhatsApp bot's tables)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mu_devices (
      device_id TEXT PRIMARY KEY,
      fcm_token TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mu_apps (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon_url TEXT,
      current_version TEXT,
      last_checked TIMESTAMP,
      updated_at TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mu_subscriptions (
      device_id TEXT NOT NULL,
      app_slug TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (device_id, app_slug)
    )
  `);

  await seedApps();

  console.log('PostgreSQL database initialized (Neon).');
}

async function seedApps() {
  const apps = [
    // ---- רשתות חברתיות ----
    { slug: 'tiktok', name: 'TikTok' },
    { slug: 'instagram', name: 'Instagram' },
    { slug: 'twitter', name: 'X (Twitter)' },
    { slug: 'pixiv', name: 'Pixiv' },
    // ---- מסנג'רים ----
    { slug: 'telegram', name: 'Telegram' },
    // ---- מוזיקה ----
    { slug: 'spotify', name: 'Spotify' },
    { slug: 'spotilol', name: 'Spotilol' },
    { slug: 'spotui', name: 'Spotui' },
    { slug: 'meld', name: 'Meld' },
    { slug: 'youtube-music', name: 'YouTube Music' },
    { slug: 'soundcloud', name: 'SoundCloud' },
    { slug: 'simpmusic', name: 'SimpMusic' },
    { slug: 'poweramp', name: 'Poweramp' },
    // ---- עריכת וידאו ----
    { slug: 'capcut-video-editor', name: 'CapCut' },
    { slug: 'alight-motion', name: 'Alight Motion' },
    { slug: 'inshot-pro', name: 'InShot Pro' },
    { slug: 'snaptube', name: 'Snaptube' },
    { slug: 'mx-player', name: 'MX Player' },
    // ---- עריכת תמונות ----
    { slug: 'picsart-photo-editor', name: 'Picsart' },
    { slug: 'lightroom', name: 'Lightroom' },
    { slug: 'remini', name: 'Remini' },
    { slug: 'pic-retouch', name: 'Pic Retouch' },
    { slug: 'oldroll', name: 'OldRoll' },
    { slug: 'animefy', name: 'Animefy' },
    // ---- סטרימינג ----
    { slug: 'netflix', name: 'Netflix' },
    { slug: 'disney-plus', name: 'Disney+' },
    { slug: 'amazon-prime', name: 'Amazon Prime Video' },
    { slug: 'crunchyroll', name: 'Crunchyroll' },
    { slug: 'moviebox', name: 'MovieBox' },
    // ---- לימוד ----
    { slug: 'duolingo', name: 'Duolingo' },
    { slug: 'busuu', name: 'Busuu' },
    { slug: 'mimo', name: 'Mimo' },
    // ---- כלים ----
    { slug: 'truecaller', name: 'Truecaller' },
    { slug: 'fake-gps', name: 'Fake GPS' },
    { slug: 'call-recorder-cube-acr', name: 'Call Recorder ACR' },
    { slug: 'gallery-vault', name: 'Gallery Vault' },
    { slug: 'proton-vpn', name: 'Proton VPN' },
    { slug: 'nordvpn', name: 'NordVPN' },
    // ---- משחקים ----
    { slug: 'roblox', name: 'Roblox' },
    { slug: 'clash-royale', name: 'Clash Royale' },
    { slug: 'subway-surfers', name: 'Subway Surfers' },
    { slug: 'idle-miner', name: 'Idle Miner Tycoon' },
    { slug: 'rider', name: 'Rider' },
    { slug: 'slay-the-spire', name: 'Slay the Spire' },
    { slug: 'friday-night-funkin', name: "Friday Night Funkin'" },
    // ---- כלים נוספים ----
    { slug: 'accuweather', name: 'AccuWeather' },
    { slug: 'fl-studio', name: 'FL Studio Mobile' },
    { slug: 'wedj', name: 'WeDJ' },
    { slug: 'kinestop', name: 'KineStop' },
    { slug: 'moovit', name: 'Moovit' },
    { slug: 'youtube-morphe', name: 'YouTube Morphe' },
  ];

  // מוסיף חדשים
  for (const app of apps) {
    await pool.query(
      'INSERT INTO mu_apps (slug, name) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING',
      [app.slug, app.name]
    );
  }

  // מוחק רשומות שכבר לא ברשימה הרשמית
  const validSlugs = apps.map(a => a.slug);
  await pool.query(
    `DELETE FROM mu_subscriptions WHERE app_slug NOT IN (${validSlugs.map((_, i) => `$${i + 1}`).join(',')})`,
    validSlugs
  );
  await pool.query(
    `DELETE FROM mu_apps WHERE slug NOT IN (${validSlugs.map((_, i) => `$${i + 1}`).join(',')})`,
    validSlugs
  );
}

async function registerDevice(deviceId, fcmToken) {
  await pool.query(
    `INSERT INTO mu_devices (device_id, fcm_token, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (device_id) DO UPDATE SET fcm_token = EXCLUDED.fcm_token, updated_at = NOW()`,
    [deviceId, fcmToken]
  );
}

async function subscribe(deviceId, appSlug) {
  await pool.query(
    'INSERT INTO mu_subscriptions (device_id, app_slug) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [deviceId, appSlug]
  );
}

async function unsubscribe(deviceId, appSlug) {
  await pool.query(
    'DELETE FROM mu_subscriptions WHERE device_id = $1 AND app_slug = $2',
    [deviceId, appSlug]
  );
}

async function getSubscriptions(deviceId) {
  const result = await pool.query(
    `SELECT s.app_slug, a.name, a.current_version, a.icon_url, a.updated_at
     FROM mu_subscriptions s
     JOIN mu_apps a ON s.app_slug = a.slug
     WHERE s.device_id = $1`,
    [deviceId]
  );
  return result.rows;
}

async function getAllApps() {
  const result = await pool.query('SELECT * FROM mu_apps ORDER BY name');
  return result.rows;
}

async function getAllVersions() {
  const result = await pool.query(
    'SELECT slug, name, current_version, last_checked, updated_at FROM mu_apps'
  );
  return result.rows;
}

async function updateAppVersion(slug, version) {
  await pool.query(
    'UPDATE mu_apps SET current_version = $1, last_checked = NOW(), updated_at = NOW() WHERE slug = $2',
    [version, slug]
  );
}

async function updateAppIcon(slug, iconUrl) {
  await pool.query('UPDATE mu_apps SET icon_url = $1 WHERE slug = $2', [iconUrl, slug]);
}

async function updateLastChecked(slug) {
  await pool.query('UPDATE mu_apps SET last_checked = NOW() WHERE slug = $1', [slug]);
}

async function getAppBySlug(slug) {
  const result = await pool.query('SELECT * FROM mu_apps WHERE slug = $1', [slug]);
  return result.rows[0] || null;
}

async function resetAllVersions() {
  await pool.query('UPDATE mu_apps SET current_version = NULL, updated_at = NULL');
}

async function deleteApp(slug) {
  await pool.query('DELETE FROM mu_subscriptions WHERE app_slug = $1', [slug]);
  await pool.query('DELETE FROM mu_apps WHERE slug = $1', [slug]);
}

async function addApp(slug, name) {
  await pool.query(
    'INSERT INTO mu_apps (slug, name) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING',
    [slug, name]
  );
}

async function getSubscribersForApp(appSlug) {
  const result = await pool.query(
    `SELECT d.fcm_token
     FROM mu_subscriptions s
     JOIN mu_devices d ON s.device_id = d.device_id
     WHERE s.app_slug = $1`,
    [appSlug]
  );
  return result.rows;
}

module.exports = {
  init,
  registerDevice,
  subscribe,
  unsubscribe,
  getSubscriptions,
  getAllApps,
  getAllVersions,
  updateAppVersion,
  updateAppIcon,
  updateLastChecked,
  getAppBySlug,
  getSubscribersForApp,
  resetAllVersions,
  deleteApp,
  addApp,
};
