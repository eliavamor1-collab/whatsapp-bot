import { sendSuspended } from "./suspended.js";

export default {
  trigger: "youtube",
  aliases: ["יוטיוב"],

  async execute(sock, message) {
    console.log("🚀 פקודת youtube הופעלה!");
    await sendSuspended(sock, message);
  }
};
