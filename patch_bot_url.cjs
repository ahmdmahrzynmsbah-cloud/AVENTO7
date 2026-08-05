const fs = require('fs');

function fix(file) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    
    code = code.replace(
      '`${window.location.origin}/?print_order=${orderId}`',
      '`${window.location.origin.replace("ais-dev-", "ais-pre-")}/?print_order=${orderId}`'
    );
    
    code = code.replace(
      '`${window.location.origin}/?print_order=${newOrder.id}`',
      '`${window.location.origin.replace("ais-dev-", "ais-pre-")}/?print_order=${newOrder.id}`'
    );

    fs.writeFileSync(file, code);
  }
}

fix('src/components/AdminPanel.tsx');
fix('src/components/CartDrawer.tsx');
