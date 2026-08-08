const fs = require('fs');
let code = fs.readFileSync('src/lib/fcm.ts', 'utf8');
code = code.replace(/, \{ vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' \}/g, '');
fs.writeFileSync('src/lib/fcm.ts', code);
