const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const handlers = `
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (event.reason.name === 'AbortError' || event.reason.message.includes('abort'))) {
    event.preventDefault();
  }
});
window.addEventListener('error', (event) => {
  if (event.error && (event.error.name === 'AbortError' || event.error.message.includes('abort'))) {
    event.preventDefault();
  }
});
`;

code = handlers + '\n' + code;

fs.writeFileSync('src/main.tsx', code);
