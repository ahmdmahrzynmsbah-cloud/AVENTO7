const fs = require('fs');
let auth = fs.readFileSync('src/components/AuthPage.tsx', 'utf8');

const target = `    if (view === 'login') {
      if (!cleanEmail || !password) {
        setError(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'PLEASE ENTER BOTH EMAIL AND PASSWORD.');
        return;
      }`;
      
const replacement = `    if (view === 'login') {
      if (!cleanEmail || !password) {
        setError(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'PLEASE ENTER BOTH EMAIL AND PASSWORD.');
        return;
      }
      
      if (cleanEmail === 'admin' || cleanEmail === 'admin@avento.com' || cleanEmail === 'a73905337@gmail.com') {
        if (password === '1234' || password === 'admin123') {
          const adminUser = { id: 'admin-1', name: 'System Admin', email: cleanEmail === 'admin' ? 'admin@avento.com' : cleanEmail, role: 'admin' as const };
          onLogin(adminUser);
          return;
        }
      }`;

auth = auth.replace(target, replacement);
fs.writeFileSync('src/components/AuthPage.tsx', auth);
console.log("Admin login updated in AuthPage");
