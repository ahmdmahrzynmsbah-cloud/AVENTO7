const fs = require('fs');

let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
admin = admin.replace(
  /storeName: storeName\.trim\(\),/,
  'storeName: storeName.trim(),\n      storeUrl: storeUrl.trim(),'
);

fs.writeFileSync('src/components/AdminPanel.tsx', admin);

