const fs = require('fs');

let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
admin = admin.replace(
  /\`\$\{settings\.storeUrl \|\| window\.location\.origin\}\/\?print_order=\$\{orderId\}\`/g,
  '`${settings.storeUrl || window.location.origin.replace("ais-dev-", "ais-pre-")}/?print_order=${orderId}`'
);
fs.writeFileSync('src/components/AdminPanel.tsx', admin);

let cart = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');
cart = cart.replace(
  /\`\$\{storeSettings\?\.storeUrl \|\| window\.location\.origin\}\/\?print_order=\$\{newOrder\.id\}\`/g,
  '`${storeSettings?.storeUrl || window.location.origin.replace("ais-dev-", "ais-pre-")}/?print_order=${newOrder.id}`'
);
fs.writeFileSync('src/components/CartDrawer.tsx', cart);

