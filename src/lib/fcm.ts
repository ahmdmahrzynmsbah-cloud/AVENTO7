import { messaging, getToken, onMessage, db } from './firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const requestNotificationPermission = async (userId: string) => {
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging); // Note: We might not need vapidKey for generic FCM if we just use default project config, or we can use empty. Let's see if we can get token without vapidKey. Wait, vapidKey is highly recommended.
      // Actually we can get token without vapidKey or by fetching it from console. 
      // But we can just try getting token directly.
      if (token) {
        // save to user profile
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token)
        });
        console.log('FCM Token registered');
      }
    }
  } catch (error) {
    console.error('FCM Error:', error);
  }
};

export const listenToForegroundMessages = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('Received foreground message', payload);
    callback(payload);
  });
};
