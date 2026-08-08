const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

const targetStr = `<button
            onClick={onLogout}
            className="text-xs luxury-tracking uppercase text-rose-600 dark:text-rose-400 font-bold hover:opacity-80 transition-opacity flex items-center gap-1 border border-rose-500/20 px-3 py-1.5"
          >
            <LogOut size={13} /> {lang === 'ar' ? 'خروج' : 'LOGOUT'}
          </button>`;

const replacementStr = `<button
            onClick={onLogout}
            className="text-xs luxury-tracking uppercase text-rose-600 dark:text-rose-400 font-bold hover:opacity-80 transition-opacity flex items-center gap-1 border border-rose-500/20 p-2 sm:px-3 sm:py-1.5"
            title={lang === 'ar' ? 'تسجيل الخروج' : 'LOGOUT'}
          >
            <LogOut size={13} /> <span className="hidden sm:inline">{lang === 'ar' ? 'خروج' : 'LOGOUT'}</span>
          </button>`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
