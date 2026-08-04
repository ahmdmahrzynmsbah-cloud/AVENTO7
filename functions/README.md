# Admin Push Notifications Cloud Function

This directory contains the Firebase Cloud Function to send FCM push notifications to admins when a new order is created.

## How to deploy:

1. Ensure you have the Firebase CLI installed: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize functions in your project root (if not already done): `firebase init functions` (select JavaScript)
4. Replace the generated `functions/index.js` with the `index.js` provided here.
5. Install `firebase-admin` and `firebase-functions` inside the `functions` directory: `cd functions && npm install`
6. Deploy the function: `firebase deploy --only functions`

Note: Sending push notifications requires Firebase Blaze (Pay-as-you-go) plan because Cloud Functions requires it.
