const fs = require('fs');
let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

navbar = navbar.replace(
  '<div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center text-center z-10 pointer-events-none px-1 overflow-hidden">',
  '<div className="absolute inset-x-0 mx-auto flex justify-center items-center text-center z-10 pointer-events-none overflow-hidden">'
);

// Also remove truncate and adjust font size slightly
navbar = navbar.replace(
  'brand-logo text-[13px] sm:text-lg md:text-xl font-black luxury-tracking tracking-[0.05em] sm:tracking-[0.25em] uppercase truncate text-[#30001A] dark:text-white whitespace-nowrap',
  'brand-logo text-[14px] sm:text-lg md:text-xl font-black luxury-tracking tracking-[0.1em] sm:tracking-[0.25em] uppercase text-[#30001A] dark:text-white whitespace-nowrap'
);

fs.writeFileSync('src/components/Navbar.tsx', navbar);
console.log("Logo centered");
