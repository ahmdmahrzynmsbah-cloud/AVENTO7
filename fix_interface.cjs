const fs = require('fs');

let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

navbar = navbar.replace(
  '  user?: User | null;',
  '  user?: User | null;\n  isAdminPreview?: boolean;'
);

fs.writeFileSync('src/components/Navbar.tsx', navbar);
