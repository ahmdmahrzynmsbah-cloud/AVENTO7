const fs = require('fs');
let auth = fs.readFileSync('src/components/AuthPage.tsx', 'utf8');

const startIndex = auth.indexOf("{/* Quick Demo Fill Credentials for Test / Convenience */}");
const endIndex = auth.indexOf("</form>", startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  auth = auth.substring(0, startIndex) + auth.substring(endIndex);
  fs.writeFileSync('src/components/AuthPage.tsx', auth);
  console.log("Quick demo removed completely");
} else {
  console.log("Could not find blocks");
}
