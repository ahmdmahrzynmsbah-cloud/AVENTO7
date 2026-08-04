const fs = require('fs');

let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Replace the center logo container
navbar = navbar.replace(
  '<div className="static md:absolute md:left-1/2 md:-translate-x-1/2 flex justify-center items-center text-center z-10 pointer-events-none px-1 overflow-hidden shrink">',
  '<div className="flex-1 flex justify-center items-center text-center z-10 pointer-events-none px-1 overflow-hidden min-w-0">'
);

// Reduce logo tracking and font size on mobile slightly more to ensure it fits
navbar = navbar.replace(
  'brand-logo text-[12px] xs:text-[14px] sm:text-lg md:text-xl font-black luxury-tracking tracking-[0.1em] xs:tracking-[0.15em] sm:tracking-[0.25em] uppercase',
  'brand-logo text-[13px] sm:text-lg md:text-xl font-black luxury-tracking tracking-[0.05em] sm:tracking-[0.25em] uppercase truncate'
);

// We need Search on the left instead of right? In DXLR, it's ≡ (left) and 🔍 🛍️ (right).
// But wait, the user's AVENTO7 screenshot has ≡ (left), and then 👤 ⇆ ♡ 🛍️ (right).
// Let's just make sure the icons are small enough and the container doesn't overlap.
// Hide Compare icon on mobile. We already did that with `hidden sm:flex`.
// Let's also hide User on mobile from top bar? No, we don't have a bottom bar.
// Make buttons smaller on mobile.
navbar = navbar.replace(
  /w-8 h-8 sm:w-11 sm:h-11 min-w-\[32px\] sm:min-w-\[44px\]/g,
  'w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px]'
);

// In the previous step, Search was added to the right, wait, Search was on the right!
// Let's check where Search is.
fs.writeFileSync('src/components/Navbar.tsx', navbar);
