const fs = require('fs');
let coll = fs.readFileSync('src/components/Collection.tsx', 'utf8');

coll = coll.replace(
  "return 'grid-cols-2 lg:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-4 md:gap-5';",
  "return 'grid-cols-2 md:grid-cols-3 gap-2.5 xs:gap-3 sm:gap-4 md:gap-5';"
);
coll = coll.replace(
  /return 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2\.5 xs:gap-3 sm:gap-4 md:gap-5';/g,
  "return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 xs:gap-3 sm:gap-4 md:gap-5';"
);
coll = coll.replace(
  "return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 xs:gap-3 sm:gap-4 md:gap-5';",
  "return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 xs:gap-3 sm:gap-4 md:gap-5';"
);

fs.writeFileSync('src/components/Collection.tsx', coll);
console.log("Grid tablet updated");
