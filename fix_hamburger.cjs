const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

const targetStr = `          <span className="brand-logo text-lg sm:text-lg tracking-widest uppercase text-wine dark:text-white">
            KEMET <span className="hidden sm:inline text-[9px] font-sans luxury-tracking text-zinc-400 dark:text-white/40 ml-1 font-semibold">{lang === 'ar' ? 'بوابة العملاء' : 'CLIENT PORTAL'}</span>
          </span>
        </div>`;

const replacementStr = `          <span className="brand-logo text-lg sm:text-lg tracking-widest uppercase text-wine dark:text-white">
            KEMET <span className="hidden sm:inline text-[9px] font-sans luxury-tracking text-zinc-400 dark:text-white/40 ml-1 font-semibold">{lang === 'ar' ? 'بوابة العملاء' : 'CLIENT PORTAL'}</span>
          </span>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden p-2 text-zinc-600 dark:text-white/70 hover:text-wine dark:hover:text-white transition-colors ml-auto mr-2"
        >
          <Menu size={20} />
        </button>`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
