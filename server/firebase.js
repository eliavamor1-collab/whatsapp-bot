const admin = require('firebase-admin');
const path = require('path');

function initFirebase() {
  try {
    let serviceAccount;

    // Prefer JSON string from env (Render deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      // Fallback: load from file path (local development)
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './service-account-key.json';
      serviceAccount = require(path.resolve(serviceAccountPath));
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin SDK initialized.');
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK:', err.message);
    console.error('Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.');
    process.exit(1);
  }
}

/**
 * Sends push notification to a list of FCM tokens.
 * Handles token batching (FCM max 500 per call).
 */
async function sendUpdateNotification(tokens, appName, oldVersion, newVersion) {
  if (!tokens || tokens.length === 0) return;

  const message = {
    notification: {
      title: `${appName} עודכן!`,
      body: `גרסה חדשה: ${newVersion} (לפני: ${oldVersion})`,
    },
    data: {
      type: 'version_update',
      appName: appName,
      oldVersion: oldVersion,
      newVersion: newVersion,
    },
    android: {
      priority: 'high',
      collapseKey: `${appName}_${Date.now()}`,
      notification: {
        channelId: 'version_updates',
        icon: 'ic_notification',
      },
    },
  };

  // FCM allows max 500 tokens per multicast
  const batchSize = 500;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: batch,
        ...message,
      });

      console.log(`Notifications sent: ${response.successCount} success, ${response.failureCount} failed`);

      // Handle failed tokens (remove invalid ones)
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.log(`Failed token: ${batch[idx]} - ${resp.error?.message}`);
          }
        });
      }
    } catch (err) {
      console.error('Error sending notifications:', err.message);
    }
  }
}

module.exports = { initFirebase, sendUpdateNotification };
