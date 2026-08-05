const fs = require('fs');

function fix(file) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    const target = '`https://ais-pre-ruogt7bxatoxwqkssqhffv-853596307183.europe-west2.run.app/?print_order=${';
    const replacement = '`${window.location.origin}/?print_order=${';
    code = code.split(target).join(replacement);
    fs.writeFileSync(file, code);
  }
}

fix('src/components/AdminPanel.tsx');
fix('src/components/CartDrawer.tsx');
