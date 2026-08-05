const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

admin = admin.replace(
  /telegramBotToken: telegramBotToken\.trim\(\),\n\s*telegramChatId: telegramChatId\.trim\(\),\n\s*telegramBotToken: telegramBotToken\.trim\(\),\n\s*telegramChatId: telegramChatId\.trim\(\)/g,
  'telegramBotToken: telegramBotToken.trim(),\n      telegramChatId: telegramChatId.trim()'
);

fs.writeFileSync('src/components/AdminPanel.tsx', admin);
