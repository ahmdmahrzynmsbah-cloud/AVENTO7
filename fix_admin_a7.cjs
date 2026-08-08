const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

admin = admin.replace(/a7clothing/g, 'kemetclothing');
admin = admin.replace(/a7store/g, 'kemetstore');

fs.writeFileSync('src/components/AdminPanel.tsx', admin);
