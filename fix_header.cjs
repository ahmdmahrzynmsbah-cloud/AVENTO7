const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

const targetStr = `<button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs luxury-tracking font-bold uppercase text-zinc-600 dark:text-white/60 hover:text-wine dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> {lang === 'ar' ? 'العودة للمتجر' : 'BACK TO STORE'}
          </button>
          <div className="h-4 w-[1px] bg-wine/10 dark:bg-white/10 hidden sm:block"></div>
          <span className="brand-logo text-lg tracking-widest uppercase text-wine dark:text-white hidden sm:block">
            KEMET <span className="text-[9px] font-sans luxury-tracking text-zinc-400 dark:text-white/40 ml-1 font-semibold">{lang === 'ar' ? 'بوابة العملاء' : 'CLIENT PORTAL'}</span>
          </span>`;

const replacementStr = `<button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs luxury-tracking font-bold uppercase text-zinc-600 dark:text-white/60 hover:text-wine dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">{lang === 'ar' ? 'العودة للمتجر' : 'BACK TO STORE'}</span>
          </button>
          <div className="h-4 w-[1px] bg-wine/10 dark:bg-white/10 hidden sm:block"></div>
          <span className="brand-logo text-lg sm:text-lg tracking-widest uppercase text-wine dark:text-white">
            KEMET <span className="hidden sm:inline text-[9px] font-sans luxury-tracking text-zinc-400 dark:text-white/40 ml-1 font-semibold">{lang === 'ar' ? 'بوابة العملاء' : 'CLIENT PORTAL'}</span>
          </span>`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
