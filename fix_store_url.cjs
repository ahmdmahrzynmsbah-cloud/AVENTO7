const fs = require('fs');

// 1. Update types.ts
let types = fs.readFileSync('src/types.ts', 'utf8');
if (!types.includes('storeUrl?: string;')) {
  types = types.replace('telegramChatId?: string;', 'telegramChatId?: string;\n  storeUrl?: string;');
  fs.writeFileSync('src/types.ts', types);
}

// 2. Update AdminPanel.tsx (Add storeUrl state and input)
let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');
if (!admin.includes('const [storeUrl, setStoreUrl]')) {
  admin = admin.replace(
    'const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || \'\');',
    'const [storeUrl, setStoreUrl] = useState(settings.storeUrl || \'\');\n  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || \'\');'
  );
  
  // Add input for storeUrl in telegram settings block or general settings block.
  // I will just add it below store name.
  admin = admin.replace(
    /value=\{storeName\}\s*onChange=\{\(e\) => setStoreName\(e\.target\.value\)\}\s*placeholder="[^"]*"\s*className="[^"]*"\s*\/>\s*<\/div>/,
    `$&
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'رابط المتجر (الفعلي للطلبات)' : 'Store URL'}
                    </label>
                    <input
                      type="url"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder="https://mystore.com"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>`
  );

  admin = admin.replace(
    '...settings, storeName, supportEmail, supportPhone, currency, freeShippingThreshold',
    '...settings, storeName, storeUrl, supportEmail, supportPhone, currency, freeShippingThreshold'
  );

  // Update URL in AdminPanel inline button
  admin = admin.replace(
    /\`\$\{window\.location\.origin\.replace\("ais-dev-", "ais-pre-"\)\}\/\?print_order=\$\{orderId\}\`/g,
    '`${settings.storeUrl || window.location.origin}/?print_order=${orderId}`'
  );
  
  admin = admin.replace(
    /\`\$\{window\.location\.origin\}\/\?print_order=\$\{orderId\}\`/g,
    '`${settings.storeUrl || window.location.origin}/?print_order=${orderId}`'
  );
  
  fs.writeFileSync('src/components/AdminPanel.tsx', admin);
}

// 3. Update CartDrawer.tsx
let cart = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');
cart = cart.replace(
  /\`\$\{window\.location\.origin\.replace\("ais-dev-", "ais-pre-"\)\}\/\?print_order=\$\{newOrder\.id\}\`/g,
  '`${storeSettings?.storeUrl || window.location.origin}/?print_order=${newOrder.id}`'
);
cart = cart.replace(
  /\`\$\{window\.location\.origin\}\/\?print_order=\$\{newOrder\.id\}\`/g,
  '`${storeSettings?.storeUrl || window.location.origin}/?print_order=${newOrder.id}`'
);

fs.writeFileSync('src/components/CartDrawer.tsx', cart);

