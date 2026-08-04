const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendOrderNotification = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;
    
    // Get all admin users
    const adminsSnapshot = await admin.firestore()
      .collection('users')
      .where('role', '==', 'admin')
      .get();
      
    const promises = [];
    
    adminsSnapshot.forEach(doc => {
      const adminData = doc.data();
      if (adminData.fcmTokens && Array.isArray(adminData.fcmTokens) && adminData.fcmTokens.length > 0) {
        
        // Extract preferred sound for New Order
        let soundName = 'default';
        if (adminData.notificationSettings && !adminData.notificationSettings.isMuted) {
          const soundUrl = adminData.notificationSettings.soundsByType?.newOrder || adminData.notificationSettings.soundUrl;
          if (soundUrl) {
            // Convert '/sounds/modern.wav' to 'modern.wav'
            const parts = soundUrl.split('/');
            soundName = parts[parts.length - 1];
          }
        } else if (adminData.notificationSettings?.isMuted) {
           soundName = ''; // mute
        }
        
        const payload = {
          notification: {
            title: '🛍️ New Order Received',
            body: `${order.customerName} placed Order #${orderId} - Total: ${order.totalAmount} EGP`,
          },
          data: {
            type: 'NEW_ORDER',
            orderId: orderId,
            clickAction: `https://${process.env.GCP_PROJECT}.web.app/admin/orders/${orderId}`,
          }
        };
        
        // Add sound to native notification if not muted
        if (soundName) {
           payload.notification.sound = soundName;
        }

        promises.push(admin.messaging().sendToDevice(adminData.fcmTokens, payload));
      }
    });
    
    if (promises.length > 0) {
      const results = await Promise.all(promises);
      console.log(`Sent notifications to ${promises.length} admins.`, results);
    } else {
      console.log('No admin FCM tokens found.');
    }
    
    // Create Notification Document in Admin Notifications Center
    await admin.firestore().collection('adminNotifications').add({
      type: 'NEW_ORDER',
      title: '🛍️ New Order Received',
      body: `${order.customerName} placed Order #${orderId} - Total: ${order.totalAmount} EGP`,
      relatedId: orderId,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return null;
  });
