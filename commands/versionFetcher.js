// ========================================
// Version Fetcher — מושך גרסאות חיות משרת Mod Updater
// ========================================
// שולף את הגרסה העדכנית של כל אפליקציה מ-API, עם cache של 5 דקות
// כדי למנוע קריאות מיותרות. אם ה-API לא זמין — מחזיר null והפקודה
// נופלת בחזרה לגרסה שכתובה בקוד.

const MOD_UPDATER_URL =
  process.env.MOD_UPDATER_URL || "https://version-tracker-server.onrender.com";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 דקות

let versionCache = null;      // { slug: version }
let cacheTimestamp = 0;

// מיפוי מ-trigger של פקודה ל-slug בשרת Mod Updater
const TRIGGER_TO_SLUG = {
  "rider": "rider",
  "roblox": "roblox",
  "subway": "subway-surfers",
  "clash royale": "clash-royale",
  "idle miner": "idle-miner",
  "friday night funkin": "friday-night-funkin",
  "slay the spire": "slay-the-spire",
  "instagram": "instagram",
  "tiktok": "tiktok",
  "twitter": "twitter",
  "telegram": "telegram",
  "nowhatsapp": "nowhatsapp",
  "amazon prime": "amazon-prime",
  "disney": "disney-plus",
  "netflix": "netflix",
  "youtube revanced": "youtube-revanced",
  "youtube vanced": "youtube-vanced",
  "youtube music": "youtube-music",
  "spotify": "spotify",
  "spotilol": "spotilol",
  "spotui": "spotui",
  "snaptube": "snaptube",
  "simpmusic": "simpmusic",
  "meld": "meld",
  "soundcloud": "soundcloud",
  "poweramp": "poweramp",
  "shazam": "shazam",
  "deezer": "deezer",
  "inshot": "inshot-pro",
  "alight motion": "alight-motion",
  "capcut": "capcut-video-editor",
  "lightroom": "lightroom",
  "picsart": "picsart-photo-editor",
  "pic retouch": "pic-retouch",
  "remini": "remini",
  "animefy": "animefy",
  "oldroll": "oldroll",
  "mx player": "mx-player",
  "truecaller": "truecaller",
  "cube acr": "call-recorder-cube-acr",
  "duolingo": "duolingo",
  "busuu": "busuu",
  "mimo": "mimo",
  "fl studio": "fl-studio",
  "fake gps": "fake-gps",
  "accuweather": "accuweather",
  "speak translate": "speak-translate",
  "proton vpn": "proton-vpn",
  "photo vault": "photo-vault",
  "moviebox": "moviebox",
  "crunchyroll": "crunchyroll",
  "pixiv": "pixiv",
};

/**
 * מרענן את ה-cache אם פג תוקפו.
 */
async function refreshCache() {
  const now = Date.now();
  if (versionCache && now - cacheTimestamp < CACHE_TTL_MS) {
    return; // ה-cache עדיין תקף
  }

  try {
    const res = await fetch(`${MOD_UPDATER_URL}/api/versions`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const map = {};
    for (const app of data.versions || []) {
      if (app.slug && app.current_version) {
        map[app.slug] = app.current_version;
      }
    }
    versionCache = map;
    cacheTimestamp = now;
    console.log(`[VersionFetcher] cache עודכן — ${Object.keys(map).length} גרסאות`);
  } catch (err) {
    console.error("[VersionFetcher] שגיאה בשליפת גרסאות:", err.message);
    // אם אין cache כלל, נשאיר null כדי שהפקודות יפלו לגרסה בקוד
  }
}

/**
 * מחזיר את הגרסה החיה של אפליקציה לפי ה-trigger שלה.
 * מחזיר null אם אין נתון — ואז הפקודה תשתמש בגרסה שכתובה בקוד.
 */
async function getLiveVersion(trigger) {
  await refreshCache();
  if (!versionCache) return null;

  const slug = TRIGGER_TO_SLUG[trigger?.toLowerCase()];
  if (!slug) return null;

  return versionCache[slug] || null;
}

/**
 * מחליף את מספר הגרסה בטקסט caption בגרסה החיה.
 * מחפש שורה שמתחילה ב-"🔢 *גירסא:*" ומחליף את הערך.
 * אם אין גרסה חיה — מחזיר את הטקסט כמו שהוא.
 */
async function applyLiveVersion(trigger, captionText) {
  const liveVersion = await getLiveVersion(trigger);
  if (!liveVersion) return captionText;

  // מחליף את הגרסה אחרי "גירסא:" (עם או בלי v בהתחלה)
  return captionText.replace(
    /(🔢 \*גירסא:\* )v?[\d.]+/,
    `$1v${liveVersion}`
  );
}

export { getLiveVersion, applyLiveVersion, TRIGGER_TO_SLUG };
