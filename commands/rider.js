let savedMessage = null;

const PRIVACY_MODE_TS_OFFSET = 77980457;
function getPrivacyModeTs() {
  return (Math.floor(Date.now() / 1000) - PRIVACY_MODE_TS_OFFSET).toString();
}

function buildBizNode() {
  return {
    tag: "biz",
    attrs: {
      actual_actors: "2",
      host_storage: "2",
      privacy_mode_ts: getPrivacyModeTs(),
    },
    content: [
      {
        tag: "interactive",
        attrs: { type: "native_flow", v: "1" },
        content: [
          {
            tag: "native_flow",
            attrs: { v: "9", name: "mixed" },
          },
        ],
      },
      {
        tag: "quality_control",
        attrs: { source_type: "third_party" },
      },
    ],
  };
}

export default {
  trigger: "rider",
  aliases: ["ריידר"],

  async execute(sock, message, helpers) {
    const jid = message.key.remoteJid;
    const userJid = sock.user?.id;
    const { proto, generateWAMessageFromContent, isJidGroup } = helpers;

    console.log("🚀 פקודת rider הופעלה!");

    const bodyText =
`📱 *שם האפליקציה:*
*ריידר (Rider)*
🔢 *גירסא:* v2.0.0
📦 *גודל:* 100 MB
💾 *סוג:* משחק
🎯 *תוכן:*
משחק אקשן ופעלולים מלהיב עם מכוניות ניאון במסלולים מאתגרים!

ℹ️ *הערות:*
פשוט להתקין ולשחק`;

    try {
      const interactiveMessage = proto.Message.InteractiveMessage.create({
        header: proto.Message.InteractiveMessage.Header.create({
          imageMessage: proto.ImageMessage.create({
            url: "https://liteapks.com/wp-content/uploads/2022/06/rider-150x150.png",
            mimetype: "image/png",
          }),
          hasMediaAttachment: true,
        }),
        body: proto.Message.InteractiveMessage.Body.create({
          text: bodyText,
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: "liteapks.com",
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [
            proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
              name: "cta_url",
              buttonParamsJson: JSON.stringify({
                display_text: "📥 להורדה לחץ כאן",
                url: "https://liteapks.com/download/rider-14435/1",
                merchant_url: "https://liteapks.com/download/rider-14435/1",
              }),
            }),
          ],
          messageParamsJson: "{}",
          messageVersion: 1,
        }),
      });

      const waMessage = generateWAMessageFromContent(
        jid,
        { interactiveMessage },
        { userJid }
      );

      const bizNode = buildBizNode();
      const botNode = { tag: "bot", attrs: { biz_bot: "1" } };
      const additionalNodes = isJidGroup(jid) ? [bizNode] : [botNode, bizNode];

      await sock.relayMessage(jid, waMessage.message, {
        messageId: waMessage.key.id,
        additionalNodes,
      });

      console.log("✅ הודעת Rider עם כפתור נשלחה בהצלחה!");
    } catch (error) {
      console.error("❌ שגיאה בשליחת הודעת rider:", error);
      await sock.sendMessage(
        jid,
        {
          image: { url: "https://liteapks.com/wp-content/uploads/2022/06/rider-150x150.png" },
          caption: bodyText + "\n\n📲 *קישור להורדה:*\nhttps://liteapks.com/download/rider-14435/1"
        },
        { quoted: message }
      );
    }
  }
};
