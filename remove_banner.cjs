const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const bannerRegex = /\{\/\* Persistent Admin Storefront Preview Sticky Banner \*\/\}\s*\{currentUser\?\.role === 'admin' && viewMode === 'store' && \([\s\S]*?\}\s*\)\}/;
app = app.replace(bannerRegex, '');

app = app.replace(
  '<Navbar \n            isAdminPreview={currentUser?.role === \'admin\' && viewMode === \'store\'}',
  '<Navbar '
);

fs.writeFileSync('src/App.tsx', app);

let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navbar = navbar.replace(
  '  isAdminPreview?: boolean;',
  ''
);
navbar = navbar.replace(
  '  onOpenCustomerDashboard,\n  isAdminPreview\n}: NavbarProps) {',
  '  onOpenCustomerDashboard\n}: NavbarProps) {'
);
navbar = navbar.replace(
  'className={`fixed left-2 right-2 sm:left-6 sm:right-6 z-50 max-w-6xl mx-auto transition-all duration-300 ${isAdminPreview ? "top-14 sm:top-16" : "top-2 sm:top-5"}`}',
  'className="fixed top-2 sm:top-5 left-2 right-2 sm:left-6 sm:right-6 z-50 max-w-6xl mx-auto transition-all duration-300"'
);
fs.writeFileSync('src/components/Navbar.tsx', navbar);
console.log("Banner removed");
