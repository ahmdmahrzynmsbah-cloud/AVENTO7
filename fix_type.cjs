const fs = require('fs');

const fix = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "role: (cleanEmail === 'a73905337@gmail.com' || cleanEmail === 'admin@avento.com') ? 'admin' : 'user' as const,",
    "role: ((cleanEmail === 'a73905337@gmail.com' || cleanEmail === 'admin@avento.com') ? 'admin' : 'user') as 'admin' | 'user',"
  );
  fs.writeFileSync(file, content);
}
fix('src/components/AuthModal.tsx');
fix('src/components/AuthPage.tsx');
console.log("Types fixed");
