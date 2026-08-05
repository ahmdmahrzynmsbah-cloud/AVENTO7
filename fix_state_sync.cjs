const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const effectCode = `
  useEffect(() => {
    setStoreName(settings.storeName || '');
    setStoreUrl(settings.storeUrl || '');
    setContactEmail(settings.supportEmail || '');
    setContactPhone(settings.supportPhone || '');
    setStoreCurrency(settings.currency || 'EGP');
    setFreeShippingThreshold(settings.freeShippingThreshold || 0);
    setMarqueeText(settings.marqueeText || '');
    setTelegramBotToken(settings.telegramBotToken || '');
    setTelegramChatId(settings.telegramChatId || '');
  }, [settings]);
`;

// Insert it after `const [socialSavedSuccess, setSocialSavedSuccess] = useState(false);`
admin = admin.replace(
  /const \[socialSavedSuccess, setSocialSavedSuccess\] = useState\(false\);\n/,
  'const [socialSavedSuccess, setSocialSavedSuccess] = useState(false);\n' + effectCode
);

fs.writeFileSync('src/components/AdminPanel.tsx', admin);
