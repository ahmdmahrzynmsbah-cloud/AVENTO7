const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  /Notification\.requestPermission\(\);/g,
  'Notification.requestPermission().catch(e => console.warn("Notif perm error:", e));'
);
fs.writeFileSync('src/App.tsx', code);
