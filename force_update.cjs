const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings);`;
const replacement = `  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings);
  useEffect(() => {
    if (storeSettings && !storeSettings.telegramBotToken && storeSettings.storeName) {
      import('./lib/db').then(({ saveSettings }) => {
        saveSettings({
          ...storeSettings,
          telegramBotToken: "8943745115:AAGvx28k0SZjExCvpRRbWInaSU-E4aEPR9o",
          telegramChatId: "7627021927"
        }).then(() => console.log("Force updated telegram settings"));
      });
    }
  }, [storeSettings]);`;

app = app.replace(target, replacement);
fs.writeFileSync('src/App.tsx', app);
