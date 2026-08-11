export default {
    trigger: "rider",

    async execute(sock, message) {
        await sock.sendMessage(
            message.key.remoteJid,
            {
                text:
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

                buttons: [
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "להורדת המשחק מהאתר liteapk.com (146.2 MB)",
                            url: "https://liteapks.com/download/rider-14435/1",
                            merchant_url: "https://liteapks.com/download/rider-14435/1"
                        })
                    }
                ]
            }
        );
    }
};
