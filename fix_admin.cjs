const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
code = code.replace(
  'const parsedPrice = Number(price);',
  'const parsedPrice = Number(price);\n    const parsedOriginalPrice = Number(originalPrice);'
);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
