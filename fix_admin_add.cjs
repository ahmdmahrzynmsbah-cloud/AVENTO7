const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  `price: parsedPrice,
        costPrice: parsedCost,`,
  `price: parsedPrice,
        originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,
        costPrice: parsedCost,`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
