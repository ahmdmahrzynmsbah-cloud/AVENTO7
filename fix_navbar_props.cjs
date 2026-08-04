const fs = require('fs');

let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

navbar = navbar.replace(
  '  onViewAdmin,\n  onOpenCustomerDashboard\n}: NavbarProps) {',
  '  onViewAdmin,\n  onOpenCustomerDashboard,\n  isAdminPreview\n}: NavbarProps) {'
);

fs.writeFileSync('src/components/Navbar.tsx', navbar);
