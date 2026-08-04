const fs = require('fs');

const files = [
  'src/components/CartDrawer.tsx',
  'src/components/WishlistDrawer.tsx',
  'src/components/CompareDrawer.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/z-50/g, 'z-[200]');
    fs.writeFileSync(file, content);
  }
});

let menu = fs.readFileSync('src/components/MobileMenu.tsx', 'utf8');
menu = menu.replace(/z-\[100\]/g, 'z-[200]');
menu = menu.replace(/z-\[101\]/g, 'z-[201]');
fs.writeFileSync('src/components/MobileMenu.tsx', menu);

console.log("Z-indices fixed");
