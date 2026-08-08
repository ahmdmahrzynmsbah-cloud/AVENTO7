const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
code = code.replace(
  /Notification\.requestPermission\(\);/g,
  'Notification.requestPermission().catch(e => console.warn(e));'
);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
