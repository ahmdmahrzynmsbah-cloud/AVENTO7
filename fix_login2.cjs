const fs = require('fs');
let auth = fs.readFileSync('src/components/AuthPage.tsx', 'utf8');

auth = auth.replace(
  "role: user.role || 'customer'",
  "role: (user.email.toLowerCase() === 'a73905337@gmail.com' || user.email.toLowerCase() === 'admin@avento.com' || user.role === 'admin') ? 'admin' : 'customer'"
);

fs.writeFileSync('src/components/AuthPage.tsx', auth);
console.log("Role logic updated");
