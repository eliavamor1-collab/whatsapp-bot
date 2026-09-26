const { gotScraping } = require('got-scraping');
const cheerio = require('cheerio');
const db = require('./database');
const { sendUpdateNotification } = require('./firebase');

// ============================================================
// מקור אחד ברור לכל אפליקציה.
//   site: 'liteapks' | '9mod'
//   type: 'download'  → https://{site}/download/{slug}/1   (הגרסה המדויקת שיורדת)
//         'page'      → https://{site}/{slug}.html          (דף ראשי)
// כל הקישורים מאומתים מהבוט של הווצאפ.
// אם אין רשומה — האפליקציה פשוט לא נסרקת (מחזיר null, בלי ניחושים).
// ============================================================
const APP_SOURCES = {
  // ---- LiteAPKS — דף הורדה (מדויק) ----
  'tiktok':                 { site: 'liteapks', type: 'download', slug: 'tiktok-81' },
  'twitter':                { site: 'liteapks', type: 'download', slug: 'twitter-78804' },
  'pixiv':                  { site: 'liteapks', type: 'download', slug: 'pixiv-32145' },
  'telegram':               { site: '9mod', type: 'download', slug: 'telegram-1051' },
  'soundcloud':             { site: 'liteapks', type: 'download', slug: 'soundcloud-119161' },
  'snaptube':               { site: 'liteapks', type: 'download', slug: 'snaptube-173' },
  'capcut-video-editor':    { site: 'liteapks', type: 'download', slug: 'capcut-video-editor-311' },
  'alight-motion':          { site: 'liteapks', type: 'download', slug: 'alight-motion-175' },
  'inshot-pro':             { site: 'liteapks', type: 'download', slug: 'inshot-pro-107' },
  'mx-player':              { site: 'liteapks', type: 'download', slug: 'mx-player-651' },
  'picsart-photo-editor':   { site: 'liteapks', type: 'download', slug: 'picsart-studio-136' },
  'lightroom':              { site: 'liteapks', type: 'download', slug: 'adobe-lightroom-205' },
  'remini':                 { site: 'liteapks', type: 'download', slug: 'remini-ai-photo-enhancer-2689' },
  'pic-retouch':            { site: 'liteapks', type: 'download', slug: 'pic-retouch-remove-objects-360706' },
  'netflix':                { site: 'liteapks', type: 'download', slug: 'netflix-72' },
  'disney-plus':            { site: 'liteapks', type: 'download', slug: 'disney-196' },
  'amazon-prime':           { site: 'liteapks', type: 'download', slug: 'amazon-prime-video-285' },
  'duolingo':               { site: 'liteapks', type: 'download', slug: 'duolingo-329' },
  'truecaller':             { site: 'crackshash', type: 'page', slug: 'truecaller-caller-id-spam' },
  'fake-gps':               { site: 'liteapks', type: 'download', slug: 'fake-gps-location-joystick-93148' },
  'call-recorder-cube-acr': { site: 'liteapks', type: 'download', slug: 'call-recorder-cube-acr-78937' },
  'subway-surfers':         { site: 'liteapks', type: 'download', slug: 'subway-surfers-14695' },
  'rider':                  { site: 'liteapks', type: 'download', slug: 'rider-14435' },
  'fl-studio':              { site: 'liteapks', type: 'download', slug: 'fl-studio-mobile-6151' },

  // ---- LiteAPKS — דף ראשי (אין קישור הורדה מאומת בבוט) ----
  'instagram':              { site: 'liteapks', type: 'page', slug: 'instagram' },
  'spotify':                { site: 'liteapks', type: 'page', slug: 'spotify-2' },

  // ---- 9mod — דף הורדה ----
  'roblox':                 { site: '9mod', type: 'download', slug: 'roblox-123' },
  'poweramp':               { site: '9mod', type: 'download', slug: 'poweramp-music-player-246512' },
  'clash-royale':           { site: '9mod', type: 'download', slug: 'clash-royale-1454' },
  'animefy':                { site: '9mod', type: 'download', slug: 'ai-video-maker-animefy-156525' },

  // ---- 9mod — דף ראשי ----
  'accuweather':            { site: '9mod', type: 'page', slug: 'accuweather' },
  'slay-the-spire':         { site: '9mod', type: 'page', slug: 'slay-the-spire' },
  'proton-vpn':             { site: 'liteapks', type: 'download', slug: 'proton-vpn-837621' },
  'nordvpn':                { site: 'liteapks', type: 'page', slug: 'nordvpn-2' },
  'moovit':                 { site: 'liteapks', type: 'download', slug: 'moovit-your-transit-tracker-604562' },
  'gallery-vault':          { site: '9mod', type: 'download', slug: 'gallery-vault-183976' },
  'oldroll':                { site: 'liteapks', type: 'page', slug: 'disposable-camera-oldroll' },
  'moviebox':               { site: 'crackshash', type: 'page', slug: 'moviebox' },
  'mimo':                   { site: '9mod', type: 'page', slug: 'mimo-learn-coding' },
  'friday-night-funkin':    { site: '9mod', type: 'page', slug: 'friday-night-funkin' },
  'crunchyroll':            { site: '9mod', type: 'page', slug: 'crunchyroll-2' },
  'busuu':                  { site: '9mod', type: 'page', slug: 'busuu-learn-languages' },

  // ---- AN1 — דף מוצר (הגרסה בכותרת "Version: X.Y.Z") ----
  'idle-miner':             { site: 'an1', type: 'page', slug: '4468-idle-miner-tycoon' },

  // ---- GitHub — סקראפינג מדף ה-releases (הגרסה בקישור הראשון "releases/tag/vX.Y.Z") ----
  'meld':                   { site: 'github', type: 'page', slug: 'FrancescoGrazioso/Meld' },
  'simpmusic':              { site: 'github', type: 'page', slug: 'maxrave-dev/SimpMusic' },

  // ---- GitHub release notes — מחלץ גרסת אפליקציה מתוך טקסט הreleases ----
  'youtube-morphe':         { site: 'github-notes', slug: 'MorpheApp/morphe-patches', pattern: 'YouTube:\\*\\* Add support for `([\\d.]+)`' },
  'youtube-music':          { site: 'github-notes', slug: 'MorpheApp/morphe-patches', pattern: 'YouTube Music:\\*\\* Add (?:experimental )?support for `([\\d.]+)`' },
  'spotilol':               { site: 'github', type: 'page', slug: 'lyssadev/Spotilol' },
  'spotui':                 { site: 'github', type: 'page', slug: 'Spotui/Spotui' },
};

const GOT_OPTS = {
  headerGeneratorOptions: {
    browsers: [{ name: 'chrome', minVersion: 120 }],
    devices: ['desktop'],
    locales: ['en-US'],
    operatingSystems: ['windows'],
  },
  timeout: { request: 20000 },
};

/**
 * גורד את הגרסה של אפליקציה מהמקור היחיד והמדויק שלה.
 */
async function scrapeAppVersion(slug) {
  const source = APP_SOURCES[slug];
  if (!source) {
    // אין מקור מוגדר — לא סורקים (בלי ניחושים)
    return { version: null, iconUrl: null };
  }

  const BASE_URLS = {
    '9mod': 'https://9mod.com',
    'liteapks': 'https://liteapks.com',
    'an1': 'https://an1.com',
  };

  let url;
  if (source.site === 'github') {
    // דף ה-releases של הריפו — הגרסה האחרונה בקישור הראשון
    url = `https://github.com/${source.slug}/releases`;
  } else if (source.site === 'github-notes') {
    // GitHub release notes — מחלץ גרסת אפליקציה מתוך טקסט ה-release
    url = `https://github.com/${source.slug}/releases/latest`;
  } else if (source.site === 'crackshash') {
    // crackshash — דף מוצר: crackshash.com/{slug}/  (הגרסה בכותרת)
    url = `https://crackshash.com/${source.slug}/`;
  } else {
    const base = BASE_URLS[source.site] || 'https://liteapks.com';
    url = source.type === 'download'
      ? `${base}/download/${source.slug}/1`
      : `${base}/${source.slug}.html`;
  }

  try {
    const response = await gotScraping({ url, ...GOT_OPTS });
    const $ = cheerio.load(response.body);

    let version = null;

    if (source.type === 'download') {
      // דף הורדה: "You are downloading AppName vX.Y.Z ..."
      const dlLine = $('body').text().match(/You are downloading[^\n]*/)?.[0] || '';
      version = extractVersion(dlLine);

      // fallback — שדה "Version X" בדף (תופס גם מספרי build בלי נקודות כמו 1013)
      if (!version) {
        const verField = $('body').text().match(/Version\s*:?\s*v?(\d[\d.]*)/i);
        if (verField) version = verField[1];
      }

      // fallback — כותרת ואז כל גוף הדף
      if (!version) version = extractVersion($('title').text());
      if (!version) version = extractVersion($('body').text());
    } else if (source.site === 'an1') {
      // AN1: הגרסה מופיעה כ-"Version: X.Y.Z" בגוף הדף
      const bodyText = $('body').text();
      const verLine = bodyText.match(/Version:\s*([\d.]+)/i);
      version = verLine ? verLine[1] : extractVersion(bodyText);
    } else if (source.site === 'github-notes') {
      // GitHub release notes API: מחפש גרסת אפליקציה ב-releases לפי pattern
      version = await scrapeGithubNotes(source.slug, source.pattern);
      return { version, iconUrl: null };
    } else if (source.site === 'github') {
      // GitHub: הרליס האחרון הוא הקישור הראשון "releases/tag/vX.Y.Z"
      const tagMatch = response.body.match(/releases\/tag\/([^"]+)"/);
      version = tagMatch ? extractVersion(tagMatch[1]) : null;
    } else if (source.site === 'github-notes') {
      // GitHub release notes: מחלץ גרסת אפליקציה לפי pattern מתוך טקסט ה-release
      const regex = new RegExp(source.pattern);
      const match = response.body.match(regex);
      version = match ? match[1] : null;
    } else {
      // דף ראשי: הגרסה בכותרת / h1 — "AppName vX.Y.Z MOD APK ..."
      version = extractVersion($('title').text());
      if (!version) version = extractVersion($('h1').first().text());
      if (!version) version = extractVersion($('body').text());
    }

    const iconUrl = $('meta[property="og:image"]').attr('content') || null;
    return { version, iconUrl };
  } catch (err) {
    console.error(`Error scraping ${slug} (${source.site}/${source.slug}):`, err.message);
    return { version: null, iconUrl: null };
  }
}

/**
 * מחפש גרסת אפליקציה ב-GitHub release notes לפי pattern.
 * עובר על releases (כולל pre-releases) עד שמוצא התאמה.
 */
async function scrapeGithubNotes(repo, pattern) {
  try {
    const regex = new RegExp(pattern);
    for (let page = 1; page <= 5; page++) {
      const response = await gotScraping({
        url: `https://api.github.com/repos/${repo}/releases?per_page=10&page=${page}`,
        headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'mod-updater-version-tracker' },
        responseType: 'json',
        timeout: { request: 20000 },
      });
      const releases = response.body;
      if (!Array.isArray(releases) || releases.length === 0) break;
      for (const release of releases) {
        const body = release.body || '';
        const match = body.match(regex);
        if (match) return match[1];
      }
    }
    return null;
  } catch (err) {
    console.error(`Error fetching GitHub notes for ${repo}:`, err.message);
    return null;
  }
}

/**
 * מחלץ מספר גרסה מטקסט. תבניות: v9.1.60.1970, v20.33.01, v1.2.3
 */
function extractVersion(text) {
  if (!text) return null;

  const vMatch = text.match(/v(\d+(?:\.\d+)+(?:\+\d+)?)/i);
  if (vMatch) return vMatch[1];

  const numMatch = text.match(/(\d+\.\d+(?:\.\d+)*)/);
  if (numMatch) return numMatch[1];

  // גרסאות בלי נקודות — מספר build (למשל Poweramp: v1023, Clash Royale: v160402002)
  const buildMatch = text.match(/v(\d{4,})/i);
  if (buildMatch) return buildMatch[1];

  return null;
}

/**
 * שולח webhook לבוט הווצאפ על עדכון גרסה.
 */
async function notifyWhatsAppBot(appSlug, appName, oldVersion, newVersion) {
  const WHATSAPP_BOT_URL = process.env.WHATSAPP_BOT_URL || 'https://whatsapp-bot-plvb.onrender.com';
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 15000; // 15 שניות בין ניסיונות — נותן לבוט זמן להתעורר

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await gotScraping({
        url: `${WHATSAPP_BOT_URL}/update-notification`,
        method: 'POST',
        json: { appSlug, appName, oldVersion, newVersion },
        timeout: { request: 15000 },
        throwHttpErrors: false,
      });

      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`[WhatsApp] Notification sent for ${appName}: ${res.statusCode}`);
        return;
      }

      console.warn(`[WhatsApp] Attempt ${attempt}/${MAX_RETRIES} failed for ${appName}: status ${res.statusCode}`);
    } catch (err) {
      console.warn(`[WhatsApp] Attempt ${attempt}/${MAX_RETRIES} error for ${appName}: ${err.message}`);
    }

    if (attempt < MAX_RETRIES) {
      console.log(`[WhatsApp] Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await sleep(RETRY_DELAY_MS);
    }
  }

  console.error(`[WhatsApp] All ${MAX_RETRIES} attempts failed for ${appName} — giving up`);
}

/**
 * בודק את כל האפליקציות לעדכוני גרסה. מחזיר מערך של עדכונים.
 */
async function checkForUpdates() {
  const apps = await db.getAllApps();
  const updates = [];

  for (const app of apps) {
    const { version: newVersion, iconUrl } = await scrapeAppVersion(app.slug);

    if (iconUrl && !app.icon_url) {
      await db.updateAppIcon(app.slug, iconUrl);
    }

    if (!newVersion) {
      await db.updateLastChecked(app.slug);
      continue;
    }

    const oldVersion = app.current_version;

    if (oldVersion && oldVersion !== newVersion) {
      console.log(`Update detected: ${app.name} ${oldVersion} → ${newVersion}`);
      await db.updateAppVersion(app.slug, newVersion);
      updates.push({ appSlug: app.slug, appName: app.name, oldVersion, newVersion });

      const subscribers = await db.getSubscribersForApp(app.slug);
      if (subscribers.length > 0) {
        const tokens = subscribers.map(s => s.fcm_token);
        await sendUpdateNotification(tokens, app.name, oldVersion, newVersion);
      }

      // שליחת webhook לבוט הווצאפ
      await notifyWhatsAppBot(app.slug, app.name, oldVersion, newVersion);

    } else if (!oldVersion && newVersion) {
      await db.updateAppVersion(app.slug, newVersion);
    } else {
      await db.updateLastChecked(app.slug);
    }

    await sleep(2000);
  }

  return updates;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { checkForUpdates, scrapeAppVersion, extractVersion, APP_SOURCES };
