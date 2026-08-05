const fs = require('fs');

function fix(file) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    const target = '${window.location.origin}/?print_order=';
    const replacement = '${window.location.origin.replace("ais-dev-", "ais-pre-")}/?print_order=';
    code = code.replace(target, replacement);
    // replace all occurrences just in case
    code = code.split(target).join(replacement);
    fs.writeFileSync(file, code);
  }
}

fix('src/components/AdminPanel.tsx');
fix('src/components/CartDrawer.tsx');
