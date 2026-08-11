export default {
    trigger: "rider",

    async execute(sock, message) {
        console.log("🚀 RIDER EXECUTE הופעל!");

        const jid = message.key.remoteJid;

        const imageUrl =
            "https://static-images.aptoide.com/_next/image?url=https%3A%2F%2Fcdn.aptoide.com%2Fimgs%2F6%2F9%2F7%2F69777a504b00c4646a330b3c4d468df2_fgraphic.png&w=3840&q=60";

        const downloadUrl =
            "https://liteapks.com/download/rider-14435/1";

        await sock.sendMessage(
            jid,
            {
                image: {
                    url: imageUrl
                },

                caption:
`📱 שם האפליקציה:
*rider*

🔢 גירסא:
v3.06.0.05

📦 גודל:
146.2 MB

💾 סוג:
משחק

🎯 תוכן:
משחק פעלולים עתידני וממכר, שבו נוהגים במסלולי ניאון מאתגרים ומנסים לא להתרסק.

ℹ️ הערות:
פשוט להתקין ולשחק`,

                interactive: [
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text:
                                "להורדת המשחק מהאתר liteapk.com (146.2 MB)",
                            url: downloadUrl,
                            merchant_url: downloadUrl
                        })
                    }
                ]
            },
            {
                quoted: message
            }
        );
    }
};
