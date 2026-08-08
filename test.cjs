const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf-8');
console.log(content.includes('--color-wine'));
