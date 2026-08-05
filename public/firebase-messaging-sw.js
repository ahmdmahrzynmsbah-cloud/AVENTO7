importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC2eijCPOBU2DwDcOSSoGFMeQd6ttPsevQ",
  authDomain: "gen-lang-client-0140690955.firebaseapp.com",
  projectId: "gen-lang-client-0140690955",
  storageBucket: "gen-lang-client-0140690955.firebasestorage.app",
  messagingSenderId: "999074803244",
  appId: "1:999074803244:web:f33dd3e72442216c896b89"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Avento7 Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'New notification',
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
