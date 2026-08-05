const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  `                  <div className="flex flex-wrap gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'OS'].map(sz => (`,
  `                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'OS'].map(sz => (`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
