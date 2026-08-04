const fs = require('fs');

let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Hide Compare icon on mobile screens (< sm)
navbar = navbar.replace(
  'aria-label="Compare Products"\n            >\n              <div className="relative flex items-center justify-center">',
  'aria-label="Compare Products"\n              className="hidden sm:flex w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] rounded-full items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer relative"\n            >\n              <div className="relative flex items-center justify-center">'
);

// We should also replace the original className for Compare icon to remove the one we just didn't match fully
navbar = navbar.replace(
  'className="w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer relative"\n              title={lang === \'ar\' ? \'مقارنة المنتجات\' : \'Compare Products\'}\n              aria-label="Compare Products"\n              className="hidden sm:flex',
  'title={lang === \'ar\' ? \'مقارنة المنتجات\' : \'Compare Products\'}\n              aria-label="Compare Products"\n              className="hidden sm:flex'
);

// Hide Profile icon on mobile screens if NOT logged in? Actually let's just leave Profile icon but make them all w-8 h-8 on mobile.
navbar = navbar.replace(
  /w-9 h-9 sm:w-11 sm:h-11 min-w-\[36px\] sm:min-w-\[44px\]/g,
  'w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px]'
);

// Logo size on mobile: reduce slightly
navbar = navbar.replace(
  'text-[13px] xs:text-[15px]',
  'text-[12px] xs:text-[14px]'
);

fs.writeFileSync('src/components/Navbar.tsx', navbar);
console.log("Navbar mobile patched");
