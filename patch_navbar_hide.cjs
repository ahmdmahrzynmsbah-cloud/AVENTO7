const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Theme toggle button hide on mobile?
// Original: className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"
code = code.replace(
  'aria-label="Toggle theme"\n          >\n            {theme === \'dark\' ?',
  'aria-label="Toggle theme"\n            className="hidden xs:flex w-11 h-11 rounded-full items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"\n          >\n            {theme === \'dark\' ?'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Navbar hide patched");
