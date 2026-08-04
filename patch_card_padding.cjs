const fs = require('fs');

let collection = fs.readFileSync('src/components/Collection.tsx', 'utf8');

// Reduce card padding
collection = collection.replace(
  'p-2.5 sm:p-4',
  'p-2 sm:p-4'
);

// Top overlay
collection = collection.replace(
  'p-1.5 sm:p-2',
  'p-1.5 sm:p-2'
);

// Buttons size inside the card overlay
collection = collection.replace(
  'w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] rounded-full flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg hover:bg-white dark:hover:bg-black hover:scale-110 transition-all cursor-pointer text-zinc-900 dark:text-white',
  'w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 min-w-[28px] xs:min-w-[36px] sm:min-w-[44px] min-h-[28px] xs:min-h-[36px] sm:min-h-[44px] rounded-full flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg hover:bg-white dark:hover:bg-black hover:scale-110 transition-all cursor-pointer text-zinc-900 dark:text-white'
);

collection = collection.replace(
  'w-9 h-9 sm:w-11 sm:h-11 min-w-[36px] sm:min-w-[44px] min-h-[36px] sm:min-h-[44px] rounded-full flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg hover:bg-white dark:hover:bg-black hover:scale-110 transition-all cursor-pointer relative text-zinc-900 dark:text-white',
  'w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 min-w-[28px] xs:min-w-[36px] sm:min-w-[44px] min-h-[28px] xs:min-h-[36px] sm:min-h-[44px] rounded-full flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg hover:bg-white dark:hover:bg-black hover:scale-110 transition-all cursor-pointer relative text-zinc-900 dark:text-white'
);

fs.writeFileSync('src/components/Collection.tsx', collection);
console.log("Card padding and overlay buttons patched");
