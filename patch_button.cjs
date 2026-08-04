const fs = require('fs');

let collection = fs.readFileSync('src/components/Collection.tsx', 'utf8');

collection = collection.replace(
  "flex items-center justify-center gap-1.5 sm:gap-2 rounded-md min-h-[32px] sm:min-h-[44px]",
  "flex items-center justify-center gap-1.5 sm:gap-2 rounded min-h-[36px] sm:min-h-[44px]"
);

// We need to also clean up the button classes if any shadow is left
collection = collection.replace(
  "text-[9px] sm:text-[11px] luxury-tracking font-bold transition-all uppercase tracking-wider cursor-pointer flex",
  "text-[10px] sm:text-[12px] luxury-tracking font-bold transition-all uppercase tracking-wider cursor-pointer flex"
);

// Title text size in the DXLR design is quite big (like 14px or 16px). Let's boost ours from 11px to 13px.
collection = collection.replace(
  "text-[11px] sm:text-[16px] font-semibold luxury-tracking",
  "text-[13px] sm:text-[16px] font-semibold luxury-tracking"
);

// The price text should also be bigger. Currently text-[14px].
collection = collection.replace(
  "text-[14px] sm:text-[22px] font-mono font-extrabold",
  "text-[15px] sm:text-[22px] font-mono font-extrabold"
);

fs.writeFileSync('src/components/Collection.tsx', collection);
console.log("Button patched");
