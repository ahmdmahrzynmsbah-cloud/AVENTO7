const fs = require('fs');

// 1. Update NavbarProps
let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
if (!navbar.includes('isAdminPreview?: boolean;')) {
  navbar = navbar.replace(
    "  user?: User | null;",
    "  user?: User | null;\n  isAdminPreview?: boolean;"
  );
}

// 2. Update Navbar fixed class
navbar = navbar.replace(
  'className="fixed top-2 sm:top-5 left-2 right-2 sm:left-6 sm:right-6 z-50 max-w-6xl mx-auto"',
  'className={`fixed left-2 right-2 sm:left-6 sm:right-6 z-50 max-w-6xl mx-auto transition-all duration-300 ${isAdminPreview ? "top-14 sm:top-16" : "top-2 sm:top-5"}`}'
);

fs.writeFileSync('src/components/Navbar.tsx', navbar);

// 3. Update App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'className="sticky top-0 z-[100] w-full bg-amber-500 text-zinc-950 px-4 py-2.5 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg border-b border-amber-600"',
  'className="fixed top-0 left-0 right-0 z-[100] w-full bg-amber-500 text-zinc-950 px-4 py-2.5 text-[10px] sm:text-xs font-bold flex flex-row items-center justify-between gap-2 shadow-lg border-b border-amber-600"'
);

// We need to pass isAdminPreview to Navbar
app = app.replace(
  '<Navbar ',
  '<Navbar \n            isAdminPreview={currentUser?.role === \'admin\' && viewMode === \'store\'}'
);

fs.writeFileSync('src/App.tsx', app);
console.log("Admin banner fixed");
