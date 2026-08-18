import { sendSuspended } from "./suspended.js";

export default {
  trigger: "telegram",
  aliases: ["טלגרם"],

  async execute(sock, message) {
    console.log("🚀 פקודת telegram הופעלה!");
    await sendSuspended(sock, message);
  }
};
