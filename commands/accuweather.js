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
  image: "https://play-lh.googleusercontent.com/jJsBxq-eGf_FfxJb5xqU4aXFf0rGxNK_1r4HUBgT-FJCxRRMQ5dYMQ3PXiqJfkZHlQ",
  links: ["https://9mod.com/accuweather.html"]
});
