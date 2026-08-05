const fs = require('fs');

const baseUrl = 'https://ais-pre-ruogt7bxatoxwqkssqhffv-853596307183.europe-west2.run.app';

function fix(file) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    const target = '`${window.location.origin.replace("ais-dev-", "ais-pre-")}/?print_order=';
    const replacement = '`' + baseUrl + '/?print_order=';
    code = code.split(target).join(replacement);
    fs.writeFileSync(file, code);
  }
}

fix('src/components/AdminPanel.tsx');
fix('src/components/CartDrawer.tsx');
