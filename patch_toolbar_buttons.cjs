const fs = require('fs');
let code = fs.readFileSync('src/components/ProductToolbar.tsx', 'utf8');

// Replace min-w-[36px] h-9 with min-w-[44px] h-[44px]
code = code.replace(/min-w-\[36px\] h-9/g, 'min-w-[44px] min-h-[44px] h-[44px]');

fs.writeFileSync('src/components/ProductToolbar.tsx', code);
console.log("Toolbar buttons patched");
