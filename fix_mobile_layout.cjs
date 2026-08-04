const fs = require('fs');

// 1. Fix Navbar.tsx
let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

navbar = navbar.replace(
  '<div className="absolute left-1/2 -translate-x-1/2 flex justify-center items-center text-center z-10 pointer-events-none">',
  '<div className="static md:absolute md:left-1/2 md:-translate-x-1/2 flex justify-center items-center text-center z-10 pointer-events-none px-1 overflow-hidden shrink">'
);

navbar = navbar.replace(
  'brand-logo text-[11px] xs:text-xs sm:text-lg md:text-xl font-black luxury-tracking tracking-[0.15em] xs:tracking-[0.2em] sm:tracking-[0.25em]',
  'brand-logo text-[13px] xs:text-[15px] sm:text-lg md:text-xl font-black luxury-tracking tracking-[0.1em] xs:tracking-[0.15em] sm:tracking-[0.25em]'
);

// Reduce button size on mobile slightly or at least don't force min-w
navbar = navbar.replace(
  /w-11 h-11 rounded-full flex items-center justify-center shrink-0/g,
  'w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0'
);

navbar = navbar.replace(
  'hidden xs:flex w-11 h-11 rounded-full items-center justify-center shrink-0',
  'hidden xs:flex w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] rounded-full items-center justify-center shrink-0'
);

fs.writeFileSync('src/components/Navbar.tsx', navbar);


// 2. Fix Collection.tsx
let collection = fs.readFileSync('src/components/Collection.tsx', 'utf8');

// Replace card container styles
collection = collection.replace(
  'className="group h-full flex flex-col justify-between bg-white dark:bg-[#0c060a]/80 border border-black/10 dark:border-white/10 rounded-[22px] p-4 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"',
  'className="group h-full flex flex-col justify-between bg-white dark:bg-[#0c060a]/80 border border-black/10 dark:border-white/10 rounded-[16px] sm:rounded-[22px] p-2.5 sm:p-4 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"'
);

// Replace image aspect ratio
collection = collection.replace(
  'aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-[#0A0A0A] mb-3 sm:mb-4 rounded-xl border border-black/5 dark:border-white/5 shrink-0',
  'aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-[#0A0A0A] mb-2 sm:mb-4 rounded-xl border border-black/5 dark:border-white/5 shrink-0'
);

// Top Overlay Flex Container (replace the old one from patch_collection_flex)
collection = collection.replace(
  /<div className="absolute top-0 left-0 w-full p-2 flex flex-col sm:flex-row items-start sm:justify-between gap-1 sm:gap-0 z-20 pointer-events-none">([\s\S]*?)<div className="flex flex-col gap-1 items-start">/m,
  '<div className="absolute top-0 left-0 w-full p-1.5 sm:p-2 flex items-start justify-between z-20 pointer-events-none">\n                        {/* Left: Badges */}\n                        <div className="flex flex-col gap-1 items-start max-w-[40%]">'
);

// Replace the right action group to ensure they are horizontal and smaller on mobile
collection = collection.replace(
  /<div className="flex items-center gap-2 pointer-events-auto self-end sm:self-auto mt-1 sm:mt-0">/m,
  '<div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0">'
);

// Replace button sizes inside the action group
collection = collection.replace(
  /w-11 h-11 min-w-\[44px\] min-h-\[44px\]/g,
  'w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px]'
);

// Typography fixes
collection = collection.replace(
  'text-[16px] font-semibold luxury-tracking',
  'text-[13px] sm:text-[16px] font-semibold luxury-tracking'
);

collection = collection.replace(
  'text-[22px] font-mono font-extrabold',
  'text-[16px] sm:text-[22px] font-mono font-extrabold'
);

collection = collection.replace(
  'text-[15px] font-bold shrink-0',
  'text-[12px] sm:text-[15px] font-bold shrink-0'
);

collection = collection.replace(
  'w-full py-2 px-2 text-[10px] sm:text-[11px] luxury-tracking font-bold transition-all uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-2 rounded-xl min-h-[44px]',
  'w-full py-1.5 sm:py-2 px-1.5 sm:px-2 text-[10px] sm:text-[11px] luxury-tracking font-bold transition-all uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl min-h-[36px] sm:min-h-[44px]'
);

// Fix grid gap in Collection
collection = collection.replace(
  /grid-cols-2 gap-3\.5/g,
  'grid-cols-2 gap-2 sm:gap-4'
);
collection = collection.replace(
  /gap-4 sm:gap-6/g,
  'gap-2 sm:gap-5'
);

fs.writeFileSync('src/components/Collection.tsx', collection);

// 3. Fix ProductToolbar (ensure items fit)
let toolbar = fs.readFileSync('src/components/ProductToolbar.tsx', 'utf8');
toolbar = toolbar.replace(
  'w-[45%] md:w-auto',
  'w-auto min-w-[40%]'
);
toolbar = toolbar.replace(
  'w-[55%] md:flex-1',
  'flex-1'
);

fs.writeFileSync('src/components/ProductToolbar.tsx', toolbar);
console.log("Mobile layout fixed");
