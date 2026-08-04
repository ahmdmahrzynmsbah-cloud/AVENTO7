const fs = require('fs');

let collection = fs.readFileSync('src/components/Collection.tsx', 'utf8');

// Change card container styling
collection = collection.replace(
  'className="group h-full flex flex-col justify-between bg-white dark:bg-[#0c060a]/80 border border-black/10 dark:border-white/10 rounded-[16px] sm:rounded-[22px] p-1.5 sm:p-4 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"',
  'className="group h-full flex flex-col justify-between bg-transparent transition-all duration-300 cursor-pointer relative"'
);

// We need to find the old one just in case
collection = collection.replace(
  'className="group h-full flex flex-col justify-between bg-white dark:bg-[#0c060a]/80 border border-black/10 dark:border-white/10 rounded-2xl p-2 sm:p-3 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"',
  'className="group h-full flex flex-col justify-between bg-transparent transition-all duration-300 cursor-pointer relative"'
);

// Reduce border/bg of image container
collection = collection.replace(
  'aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-[#0A0A0A] mb-1.5 sm:mb-4 rounded-xl border border-black/5 dark:border-white/5 shrink-0',
  'aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-[#0A0A0A] mb-2 sm:mb-3 rounded-2xl shrink-0 relative'
);

// Fix title & price padding
collection = collection.replace(
  '<div className="px-1 flex-1">',
  '<div className="px-0.5 flex-1 mt-1">'
);

collection = collection.replace(
  '<div className="px-1 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1.5 w-full">',
  '<div className="px-0.5 pt-1 flex items-center justify-between gap-1.5 w-full">'
);

// Remove the `flex flex-col w-full` wrapper around the image and title if it has padding, wait, it doesn't have padding.

// Adjust bottom button padding
collection = collection.replace(
  '<div className="flex flex-col gap-3 mt-3 w-full">',
  '<div className="flex flex-col gap-2.5 mt-auto w-full">'
);

fs.writeFileSync('src/components/Collection.tsx', collection);
console.log("Flat cards patched");
