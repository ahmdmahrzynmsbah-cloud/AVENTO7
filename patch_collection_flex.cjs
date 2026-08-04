const fs = require('fs');
let code = fs.readFileSync('src/components/Collection.tsx', 'utf8');

code = code.replace(
  '                      {/* Top Overlay Flex Container (Avoid Overlap) */}\n                      <div className="absolute top-0 left-0 w-full p-2 flex items-start justify-between z-20 pointer-events-none">',
  '                      {/* Top Overlay Flex Container (Avoid Overlap) */}\n                      <div className="absolute top-0 left-0 w-full p-2 flex flex-col sm:flex-row items-start sm:justify-between gap-1 sm:gap-0 z-20 pointer-events-none">'
);

// We need to move the Right action group to align right even if flex-col
code = code.replace(
  '                        {/* Right Action Group: Compare & Wishlist */}\n                        <div className="flex items-center gap-2 pointer-events-auto">',
  '                        {/* Right Action Group: Compare & Wishlist */}\n                        <div className="flex items-center gap-2 pointer-events-auto self-end sm:self-auto mt-1 sm:mt-0">'
);

fs.writeFileSync('src/components/Collection.tsx', code);
console.log("Collection flex patched");
