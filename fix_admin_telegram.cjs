const fs = require('fs');
let panel = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// Add state
const stateTarget = "  const [tiktokUrl, setTiktokUrl] = useState(settings.socialLinks?.tiktok || '');";
const stateReplace = `  const [tiktokUrl, setTiktokUrl] = useState(settings.socialLinks?.tiktok || '');
  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || '');`;
panel = panel.replace(stateTarget, stateReplace);

// Add to handleSaveGeneralSettings
const saveTarget = `      freeShippingThreshold,
      marqueeText
    });`;
const saveReplace = `      freeShippingThreshold,
      marqueeText,
      telegramBotToken,
      telegramChatId
    });`;
panel = panel.replace(saveTarget, saveReplace);

// Add UI
const uiTarget = `              {/* 4. Push Notification Settings */}`;
const uiReplace = `              {/* Telegram Notifications */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
                <div className="border-b border-black/5 dark:border-white/5 pb-3">
                  <h3 className="text-sm font-extrabold uppercase luxury-tracking text-zinc-900 dark:text-white flex items-center gap-2">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#0088cc]"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                    {lang === 'ar' ? 'إشعارات تليجرام الفورية' : 'Telegram Instant Notifications'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {lang === 'ar' ? 'أدخل بيانات البوت الخاص بك لتتلقى إشعارات الطلبات الجديدة على هاتفك عبر تطبيق تليجرام، حتى لو كان الموقع مغلقاً.' : 'Receive instant new order notifications on your phone via Telegram, even when the site is closed.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'توكن البوت (Bot Token)' : 'BOT TOKEN'}
                    </label>
                    <input
                      type="text"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="e.g. 123456789:ABCdefGHIjklmnoPQRstuvWXYZ"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'رقم الشات (Chat ID)' : 'CHAT ID'}
                    </label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="e.g. 123456789"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Push Notification Settings */}`;
panel = panel.replace(uiTarget, uiReplace);

fs.writeFileSync('src/components/AdminPanel.tsx', panel);
console.log("AdminPanel updated with Telegram");
