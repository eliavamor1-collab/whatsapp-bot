import { sendSuspended } from "./suspended.js";

export default {
  trigger: "youtube music",
  aliases: ["יוטיוב מיוזיק"],

  async execute(sock, message) {
    console.log("🚀 פקודת youtube music הופעלה!");
    await sendSuspended(sock, message);
  }
};
