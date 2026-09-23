import { createApp } from "../system/appTemplate.js";

export default createApp({
  trigger: "accuweather",
  aliases: ["מזג אוויר", "אקיווודר"],
  name: "AccuWeather",
  version: "v21.1.15",
  size: "~50 MB",
  type: "מזג אוויר",
  content: "תחזית מזג אוויר הכי מדויקת — לדקה הקרובה, לשעה, לשבוע. התראות גשם, מפת רדאר, ואינדקס UV.",
  notes: "פרימיום פרוץ — בלי פרסומות",
  image: "https://9mod.com/wp-content/uploads/2025/01/accuweather-weather-radar-150x150.webp",
  links: ["https://9mod.com/download/accuweather-90235/1"]
});
