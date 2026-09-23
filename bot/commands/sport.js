import { createApp } from "../system/appTemplate.js";

export default createApp({
  trigger: "ספורט",
  aliases: ["sport", "liveball"],
  name: "LiveBall — צפייה בספורט בלייב",
  type: "צפייה בספורט (אתר)",
  content: "צפייה חינמית בשידורים חיים של משחקי ספורט — כדורגל, כדורסל, הוקי ועוד, ישירות מהדפדפן.",
  notes: "לא דורש הורדה — פתח מהדפדפן ותיהנה!",
  links: [{ label: "⚽ *כניסה לאתר:*", url: "https://liveball.sx/" }]
});
