const fs = require('fs');
let auth = fs.readFileSync('src/components/AuthPage.tsx', 'utf8');

auth = auth.replace('placeholder="E.G. AHMED HASSAN"', "placeholder={lang === 'ar' ? 'الاسم بالكامل' : 'ENTER YOUR FULL NAME'}");
auth = auth.replace('placeholder="1012345678"', "placeholder={lang === 'ar' ? 'رقم الهاتف' : 'PHONE NUMBER'}");
auth = auth.replace('placeholder={"USER@EXAMPLE.COM"}', "placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}");

fs.writeFileSync('src/components/AuthPage.tsx', auth);
console.log("Placeholders updated.");
