const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(/text-xs xs:text-sm sm:text-xl md:text-2xl/g, 'text-[11px] xs:text-xs sm:text-lg md:text-xl');

// And for the right icons gap
code = code.replace(/gap-0\.5 xs:gap-1\.5 sm:gap-3/g, 'gap-0 sm:gap-2');

// Make the buttons min 44x44
code = code.replace(/p-1 sm:p-2 rounded-full/g, 'w-11 h-11 rounded-full flex items-center justify-center shrink-0');

fs.writeFileSync('src/components/Navbar.tsx', code);
console.log("Navbar patched");
