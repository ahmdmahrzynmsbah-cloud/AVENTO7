const fs = require('fs');

let collection = fs.readFileSync('src/components/Collection.tsx', 'utf8');

// Adjust grid gaps to be balanced
collection = collection.replace(
  /grid-cols-2 gap-1 sm:gap-5/g,
  'grid-cols-2 gap-2.5 xs:gap-3 sm:gap-5'
);
collection = collection.replace(
  /grid-cols-2 md:grid-cols-3 gap-1 sm:gap-5/g,
  'grid-cols-2 md:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-5'
);
collection = collection.replace(
  /grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-5/g,
  'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-5'
);
collection = collection.replace(
  /grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5/g,
  'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 xs:gap-3 sm:gap-5'
);
collection = collection.replace(
  /grid-cols-1 gap-4 sm:gap-5/g,
  'grid-cols-1 gap-2.5 xs:gap-3 sm:gap-5'
);

// Adjust section padding
collection = collection.replace(
  'className="w-full flex flex-col items-center px-2 sm:px-6 lg:px-8"',
  'className="w-full flex flex-col items-center px-3 xs:px-4 sm:px-6 lg:px-8"'
);

// Adjust Toolbar container width/padding? It's inside the same section, so it takes the same padding.
// The toolbar itself has w-full.

fs.writeFileSync('src/components/Collection.tsx', collection);
console.log("Spacing patched");
