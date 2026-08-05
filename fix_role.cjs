const fs = require('fs');

const fixFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /role:\s*'user',?\s*(\n\s*createdAt:)/g,
    "role: (user.email.toLowerCase() === 'a73905337@gmail.com' || user.email.toLowerCase() === 'admin@avento.com' || user.role === 'admin') ? 'admin' : 'user',$1"
  );
  content = content.replace(
    /role:\s*'user'\s*as\s*const,?\s*(\n\s*createdAt:)/g,
    "role: (cleanEmail === 'a73905337@gmail.com' || cleanEmail === 'admin@avento.com') ? 'admin' : 'user' as const,$1"
  );
  // for newUser in AuthModal
  content = content.replace(
    /role:\s*'user',?\s*(\n\s*createdAt:\s*newUser\.createdAt)/g,
    "role: (newUser.email.toLowerCase() === 'a73905337@gmail.com' || newUser.email.toLowerCase() === 'admin@avento.com') ? 'admin' : 'user',$1"
  );
  fs.writeFileSync(file, content);
}

fixFile('src/components/AuthModal.tsx');
fixFile('src/components/AuthPage.tsx');

console.log("Roles fixed");
