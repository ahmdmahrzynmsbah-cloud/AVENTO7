const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const footerTarget = `{viewMode === 'store' && (
          <>
            <Footer`;
const footerReplace = `{!printOrderId && viewMode === 'store' && (
          <>
            <Footer`;

if (app.includes(footerTarget)) {
  app = app.replace(footerTarget, footerReplace);
  fs.writeFileSync('src/App.tsx', app);
}
