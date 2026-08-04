const fs = require('fs');
let navbar = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
if (navbar.includes('absolute left-1/2')) {
  console.log('Still absolute');
} else {
  console.log('Not absolute');
}
