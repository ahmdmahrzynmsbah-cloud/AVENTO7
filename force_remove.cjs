const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// The banner starts at {currentUser?.role === 'admin' && viewMode === 'store' && (
// and ends with )} just before {viewMode === 'store' && (

const startIndex = app.indexOf("{currentUser?.role === 'admin' && viewMode === 'store' && (");
const endIndex = app.indexOf("{viewMode === 'store' && (", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  // Let's also remove the previous line if it has the comment
  const commentIndex = app.lastIndexOf("{/* Persistent Admin Storefront Preview Sticky Banner */}", startIndex);
  const actualStart = commentIndex !== -1 ? commentIndex : startIndex;
  
  app = app.substring(0, actualStart) + app.substring(endIndex);
  fs.writeFileSync('src/App.tsx', app);
  console.log("Successfully removed the banner block by index.");
} else {
  console.log("Could not find the block.");
}
