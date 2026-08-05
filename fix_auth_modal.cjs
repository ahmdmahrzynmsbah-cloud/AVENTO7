const fs = require('fs');
let modal = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

const target = `      if (cleanEmail === 'admin' || cleanEmail === 'admin@avento.com' || cleanEmail === 'a73905337@gmail.com') {
        if (password === '1234' || password.toLowerCase() === 'admin123') {
          const adminUser: User = { id: 'admin-1', name: 'System Admin', email: 'admin@avento.com', role: 'admin' };
          onLogin(adminUser);
          onClose();
          return;
        } else {
          setError(lang === 'ar' ? 'كلمة مرور مدير النظام غير صحيحة.' : 'INCORRECT PASSWORD FOR ADMIN ACCOUNT.');
          return;
        }
      }`;

const replacement = `      if (cleanEmail === 'admin' || cleanEmail === 'admin@avento.com' || cleanEmail === 'a73905337@gmail.com') {
        if (password === '1234' || password.toLowerCase() === 'admin123') {
          const adminUser: User = { id: 'admin-1', name: 'System Admin', email: cleanEmail === 'admin' ? 'admin@avento.com' : cleanEmail, role: 'admin' };
          onLogin(adminUser);
          onClose();
          return;
        }
      }`;

modal = modal.replace(target, replacement);

const target2 = `        const loggedUser: User = { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          phone: user.phone, 
          role: user.role, 
          createdAt: user.createdAt 
        };`;

const replacement2 = `        const loggedUser: User = { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          phone: user.phone, 
          role: (user.email.toLowerCase() === 'a73905337@gmail.com' || user.email.toLowerCase() === 'admin@avento.com' || user.role === 'admin') ? 'admin' : 'user', 
          createdAt: user.createdAt 
        };`;

modal = modal.replace(target2, replacement2);
fs.writeFileSync('src/components/AuthModal.tsx', modal);
console.log("Fixed AuthModal");
