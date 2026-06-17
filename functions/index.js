// Cloud Function: when a new message is written into chats/{chatId}/messages/{msgId},
// look up every chat member that is not the sender, fetch their FCM tokens, and
// send a push notification to all of them. Invalid tokens are pruned so the list
// doesn't grow forever.
//
// Deploy:   firebase deploy --only functions
// Region:   asia-southeast1 (matches the Realtime Database region)

// Using v1 SDK because Realtime Database triggers are simpler there.
// firebase-functions v6+ still ships v1 under this path.
const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

admin.initializeApp();

// The Realtime Database lives in asia-southeast1, so the trigger must run there
// or it won't see writes.
const REGION = 'asia-southeast1';

exports.notifyOnChatMessage = functions
  .region(REGION)
  .database
  .ref('/chats/{chatId}/messages/{msgId}')
  .onCreate(async (snap, context) => {
    const msg = snap.val();
    const chatId = context.params.chatId;

    if (!msg || !msg.from || !msg.text) {
      console.log('notifyOnChatMessage: missing fields, skipping', { chatId });
      return null;
    }

    // 1. Find chat members (excluding sender)
    const membersSnap = await admin
      .database()
      .ref(`/chats/${chatId}/meta/members`)
      .once('value');
    const members = membersSnap.val() || {};
    const recipients = Object.keys(members).filter(uid => uid !== msg.from);
    if (!recipients.length) {
      console.log('notifyOnChatMessage: no recipients', { chatId });
      return null;
    }

    // 2. Collect FCM tokens for each recipient (and remember which uid owns each
    //    token so we can prune invalid ones precisely).
    const tokenOwnership = {}; // token -> uid
    await Promise.all(
      recipients.map(async uid => {
        const ts = await admin
          .database()
          .ref(`/users/${uid}/fcmTokens`)
          .once('value');
        const v = ts.val() || {};
        Object.keys(v).forEach(t => { tokenOwnership[t] = uid; });
      })
    );
    const tokens = Object.keys(tokenOwnership);
    if (!tokens.length) {
      console.log('notifyOnChatMessage: no tokens for recipients', { chatId, recipients });
      return null;
    }

    // 3. Build payload
    const title = msg.fromName || 'Новое сообщение';
    const body  = msg.text.length > 100 ? msg.text.slice(0, 100) + '…' : msg.text;

    const message = {
      notification: { title, body },
      data: {
        chatId: String(chatId),
        from: String(msg.from),
        fromName: String(msg.fromName || '')
      },
      webpush: {
        notification: {
          icon: '/assets/logo-app.png',
          badge: '/assets/logo-app.png',
          tag: `chat-${chatId}`,
          renotify: true
        },
        fcm_options: { link: '/' }
      },
      tokens
    };

    // 4. Send + clean up dead tokens
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`notifyOnChatMessage: ${response.successCount}/${tokens.length} delivered`);

    const updates = {};
    response.responses.forEach((r, i) => {
      if (r.success) return;
      const code = r.error && r.error.code;
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token' ||
        code === 'messaging/invalid-argument'
      ) {
        const tok = tokens[i];
        const ownerUid = tokenOwnership[tok];
        if (ownerUid) updates[`/users/${ownerUid}/fcmTokens/${tok}`] = null;
      } else if (r.error) {
        console.warn('FCM send error', r.error.code, r.error.message);
      }
    });
    if (Object.keys(updates).length) {
      await admin.database().ref().update(updates);
      console.log(`notifyOnChatMessage: pruned ${Object.keys(updates).length} dead tokens`);
    }

    return null;
  });
