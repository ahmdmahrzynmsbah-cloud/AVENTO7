const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

admin = admin.replace(
  /tiktok: tiktokUrl\.trim\(\)\n\s*}\n\s*}\);/,
  'tiktok: tiktokUrl.trim()\n      },\n      telegramBotToken: telegramBotToken.trim(),\n      telegramChatId: telegramChatId.trim()\n    });'
);

fs.writeFileSync('src/components/AdminPanel.tsx', admin);
