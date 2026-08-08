const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

const effectToInsert = `
  useEffect(() => {
    if (storeSettings && storeSettings.storeName && storeSettings.storeName.toUpperCase().includes('AVENTO')) {
      import('./lib/db').then(({ saveSettings }) => {
        saveSettings({
          ...storeSettings,
          storeName: storeSettings.storeName.replace(/AVENTO7/ig, 'KEMET').replace(/AVENTO/ig, 'KEMET')
        }).then(() => console.log("Force updated store name"));
      });
    }
  }, [storeSettings]);
`;

// Insert it somewhere inside the App component, e.g. after `const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings);`
app = app.replace(
  /const \[storeSettings, setStoreSettings\] = useState<StoreSettings>\(defaultSettings\);/,
  'const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings);\n' + effectToInsert
);

fs.writeFileSync('src/App.tsx', app);
