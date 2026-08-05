const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /useEffect\(\(\) => \{\n\s*if \(storeSettings && !storeSettings\.telegramBotToken && storeSettings\.storeName\) \{\n\s*import\('\.\/lib\/db'\)\.then\(\(\{ saveSettings \}\) => \{\n\s*saveSettings\(\{\n\s*\.\.\.storeSettings,\n\s*telegramBotToken: "8943745115:AAGvx28k0SZjExCvpRRbWInaSU-E4aEPR9o",\n\s*telegramChatId: "7627021927"\n\s*\}\)\.then\(\(\) => console\.log\("Force updated telegram settings"\)\);\n\s*\}\);\n\s*\}\n\s*\}, \[storeSettings\]\);/g,
  ''
);

fs.writeFileSync('src/App.tsx', app);
