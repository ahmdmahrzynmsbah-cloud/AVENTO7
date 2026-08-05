const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  `price: parsedPrice,
          originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,
          originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,`,
  `price: parsedPrice,
          originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,`
);

code = code.replace(
  `price: parsedPrice,
        originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,
        originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,`,
  `price: parsedPrice,
        originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
