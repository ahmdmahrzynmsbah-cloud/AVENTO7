const fs = require('fs');

const fix = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /role: \(user\.email\.toLowerCase\(\) === 'a73905337@gmail\.com' \|\| user\.email\.toLowerCase\(\) === 'admin@avento\.com' \|\| user\.role === 'admin'\) \? 'admin' : 'user',(\s*createdAt: newUser\.createdAt)/g,
    "role: ((newUser.email.toLowerCase() === 'a73905337@gmail.com' || newUser.email.toLowerCase() === 'admin@avento.com') ? 'admin' : 'user') as 'admin' | 'user',$1"
  );
  content = content.replace(
    /role: \(user\.email\.toLowerCase\(\) === 'a73905337@gmail\.com' \|\| user\.email\.toLowerCase\(\) === 'admin@avento\.com' \|\| user\.role === 'admin'\) \? 'admin' : 'user',(\s*createdAt: user\.createdAt)/g,
    "role: ((user.email.toLowerCase() === 'a73905337@gmail.com' || user.email.toLowerCase() === 'admin@avento.com' || user.role === 'admin') ? 'admin' : 'user') as 'admin' | 'user',$1"
  );
  fs.writeFileSync(file, content);
}
fix('src/components/AuthModal.tsx');
fix('src/components/AuthPage.tsx');
console.log("Fixed type completely");
