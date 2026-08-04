const fs = require('fs');

let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Ensure Left Menu Button is also w-8 h-8 on mobile
navbar = navbar.replace(
  'w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer',
  'w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer'
);

fs.writeFileSync('src/components/Navbar.tsx', navbar);
