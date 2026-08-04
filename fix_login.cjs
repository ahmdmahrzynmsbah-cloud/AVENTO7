const fs = require('fs');
let auth = fs.readFileSync('src/components/AuthPage.tsx', 'utf8');

// 1. Remove the hardcoded Admin Check
const adminCheckRegex = /\/\/ Check Admin Credentials[\s\S]*?\/\/ Fetch Registered Accounts/;
auth = auth.replace(adminCheckRegex, '// Fetch Registered Accounts');

// 2. Modify the role assignment
const userLoginRegex = /onLogin\(\{ id: user\.id, name: user\.name, email: user\.email, role: 'customer' \}\);/;
auth = auth.replace(userLoginRegex, 
  "const isAdmin = user.email.toLowerCase() === 'a73905337@gmail.com' || user.email.toLowerCase() === 'admin@avento.com';\n          onLogin({ id: user.id, name: user.name, email: user.email, role: isAdmin ? 'admin' : 'customer' });"
);

// 3. Update the labels for login input
auth = auth.replace(/view === 'login' \? \(lang === 'ar' \? "البريد الإلكتروني أو 'ADMIN'" : "EMAIL OR 'ADMIN'"\) : \(lang === 'ar' \? 'البريد الإلكتروني' : 'EMAIL ADDRESS'\)/g, 
  "view === 'login' ? (lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS') : (lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS')"
);
auth = auth.replace(/view === 'login' \? "USER@EXAMPLE.COM OR 'ADMIN'" : "YOUR@EMAIL.COM"/g, 
  '"USER@EXAMPLE.COM"'
);

fs.writeFileSync('src/components/AuthPage.tsx', auth);
console.log("Login logic updated");
