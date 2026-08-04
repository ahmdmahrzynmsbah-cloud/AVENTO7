const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// For Collection in App.tsx
app = app.replace(
  '<div className="w-full max-w-[1400px] px-6 md:px-12">\n                  <Collection ',
  '<div className="w-full max-w-[1600px] px-0 sm:px-6 md:px-12">\n                  <Collection '
);
fs.writeFileSync('src/App.tsx', app);

let collection = fs.readFileSync('src/components/Collection.tsx', 'utf8');
// Reduce section padding on mobile
collection = collection.replace(
  'className="w-full flex flex-col items-center px-4 sm:px-6 lg:px-8"',
  'className="w-full flex flex-col items-center px-2 sm:px-6 lg:px-8"'
);

// Reduce gap on mobile
collection = collection.replace(
  /gap-2 sm:gap-5/g,
  'gap-1.5 xs:gap-2 sm:gap-5'
);

fs.writeFileSync('src/components/Collection.tsx', collection);

console.log("Padding patched");
