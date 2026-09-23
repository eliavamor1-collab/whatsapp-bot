# WhatsApp Bot

בוט וואטסאפ לאפליקציות מוד + שרת מעקב גרסאות.

## מבנה הפרויקט

```
whatsapp-bot/
  bot/      ← בוט WhatsApp (Node.js ESM)
  server/   ← שרת מעקב גרסאות (Node.js CommonJS)
```

## bot/
בוט WhatsApp שמגיב לפקודות בקבוצות ושולח מידע על אפליקציות מוד.

**הפעלה:**
```bash
cd bot
npm install
npm start
```

**משתני סביבה נדרשים:**
- `DATABASE_URL` — חיבור Neon PostgreSQL
- `RENDER_EXTERNAL_URL` — כתובת השירות ב-Render
- `MOD_UPDATER_URL` — כתובת שרת הגרסאות

## server/
שרת שסורק גרסאות אפליקציות ושולח התראות FCM.

**הפעלה:**
```bash
cd server
npm install
npm start
```

**משתני סביבה נדרשים:**
- `DATABASE_URL` — חיבור Neon PostgreSQL
- `FIREBASE_SERVICE_ACCOUNT_JSON` — מפתח Firebase (JSON string)
- `CRON_SCHEDULE` — תזמון סריקה (ברירת מחדל: `*/30 * * * *`)
- `WHATSAPP_BOT_URL` — כתובת הבוט לשליחת התראות

## Render Deployment
כל שירות מוגדר ב-`render.yaml` שלו עם `rootDir` מתאים.
