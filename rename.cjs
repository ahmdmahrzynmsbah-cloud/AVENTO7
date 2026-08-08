const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /AVENTO7/g, replace: 'KEMET' },
  { search: /Avento7/g, replace: 'Kemet' },
  { search: /AVENTO/g, replace: 'KEMET' },
  { search: /Avento/g, replace: 'Kemet' },
  { search: /A7 BRAND STORE/g, replace: 'KEMET BRAND STORE' },
  { search: /A7 CONTROL/g, replace: 'KEMET CONTROL' },
  { search: /A7 BRAND/g, replace: 'KEMET BRAND' },
  { search: />A7</g, replace: '>KEMET<' },
];

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const rep of replacements) {
    content = content.replace(rep.search, rep.replace);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        processDirectory(fullPath);
      }
    } else {
      if (
        fullPath.endsWith('.tsx') ||
        fullPath.endsWith('.ts') ||
        fullPath.endsWith('.html') ||
        fullPath.endsWith('.json')
      ) {
        replaceInFile(fullPath);
      }
    }
  }
}

processDirectory('./src');
replaceInFile('./index.html');
replaceInFile('./metadata.json');
