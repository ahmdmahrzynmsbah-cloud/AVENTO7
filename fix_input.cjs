const fs = require('fs');

let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const target = `<div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'اسم المتجر (يظهر في الهيدر والفوتر)' : 'STORE NAME'}
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>`;

const replacement = target + `
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'رابط المتجر (يستخدم في إشعارات تليجرام لطباعة الفاتورة)' : 'STORE URL'}
                    </label>
                    <input
                      type="url"
                      value={storeUrl}
                      onChange={(e) => setStoreUrl(e.target.value)}
                      placeholder="https://mystore.com"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>`;

admin = admin.replace(target, replacement);

fs.writeFileSync('src/components/AdminPanel.tsx', admin);

