// ============================================================
// כלי בדיקה קבוע — בודק מה השרת מחלץ עבור אפליקציה מסוימת.
//
// שימוש:
//   node test-scrape.js <slug>        בדיקת אפליקציה אחת
//   node test-scrape.js <slug1> <slug2> ...   בדיקת כמה
//   node test-scrape.js --all         בדיקת כל האפליקציות שיש להן מקור
//
// דוגמאות:
//   node test-scrape.js idle-miner
//   node test-scrape.js proton-vpn gallery-vault meld
//   node test-scrape.js --all
//
// הכלי משתמש בפונקציית ה-scraping האמיתית של השרת (scrapeAppVersion),
// כך שהתוצאה משקפת בדיוק את מה שהשרת יעשה בפועל.
// ============================================================

const { scrapeAppVersion, APP_SOURCES } = require('./scraper');

async function run() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('שימוש: node test-scrape.js <slug> [slug2 ...]  |  --all');
    console.log('דוגמה: node test-scrape.js idle-miner proton-vpn');
    process.exit(0);
  }

  let slugs;
  if (args.includes('--all')) {
    slugs = Object.keys(APP_SOURCES).sort();
  } else {
    slugs = args;
  }

  console.log(`\nבודק ${slugs.length} אפליקציה/ות...\n`);
  console.log('SLUG'.padEnd(28) + 'VERSION');
  console.log('-'.repeat(45));

  for (const slug of slugs) {
    try {
      const { version } = await scrapeAppVersion(slug);
      const shown = version ? version : '❌ null';
      console.log(slug.padEnd(28) + shown);
    } catch (err) {
      console.log(slug.padEnd(28) + `⚠️  שגיאה: ${err.message}`);
    }
  }

  console.log('');
}

run();
