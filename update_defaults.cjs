const fs = require('fs');
let content = fs.readFileSync('src/lib/db.ts', 'utf8');
content = content.replace(
  'marqueeText: "WELCOME TO AVENTO7. SHOP THE LATEST LUXURY COLLECTION TODAY."',
  'marqueeText: "WELCOME TO AVENTO7. SHOP THE LATEST LUXURY COLLECTION TODAY.",\n  telegramBotToken: "8943745115:AAGvx28k0SZjExCvpRRbWInaSU-E4aEPR9o",\n  telegramChatId: "7627021927"'
);
fs.writeFileSync('src/lib/db.ts', content);
console.log("Updated defaultSettings");
