const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  '            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"\n            title={theme === \'dark\' ? (lang === \'ar\' ? \'الوضع الفاتح\' : \'Light Mode\') : (lang === \'ar\' ? \'الوضع الداكن\' : \'Dark Mode\')}\n            aria-label="Toggle theme"\n            className="hidden xs:flex w-11 h-11 rounded-full items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"',
  '            title={theme === \'dark\' ? (lang === \'ar\' ? \'الوضع الفاتح\' : \'Light Mode\') : (lang === \'ar\' ? \'الوضع الداكن\' : \'Dark Mode\')}\n            aria-label="Toggle theme"\n            className="hidden xs:flex w-11 h-11 rounded-full items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Navbar fixed");
