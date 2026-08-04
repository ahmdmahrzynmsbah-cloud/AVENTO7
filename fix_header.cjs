const fs = require('fs');
let auth = fs.readFileSync('src/components/AuthPage.tsx', 'utf8');

// 1. Fix header
const headerRegex = /<header className="w-full px-6 md:px-12 py-6 flex items-center justify-between z-30">[\s\S]*?<\/header>/;
const newHeader = `<header className="w-full px-4 sm:px-6 md:px-12 py-6 flex items-center justify-between z-30 relative">
        <div className="flex-1 flex justify-start">
          <button
            onClick={onBackToStore}
            className="flex items-center justify-center w-10 h-10 rounded-full text-[#30001A] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={18} className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <a href="#" onClick={onBackToStore} className="brand-logo flex-1 text-center text-xl sm:text-2xl font-black luxury-tracking tracking-[0.25em] uppercase text-[#30001A] dark:text-white shrink-0">
          AVENTO7
        </a>

        <div className="flex-1 flex justify-end">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>`;

auth = auth.replace(headerRegex, newHeader);

// 2. Fix CREATE ACCOUNT text wrapping
const h2Target = 'className="serif-display text-3xl sm:text-4xl font-light tracking-wider uppercase text-[#30001A] dark:text-white mb-6"';
const h2Replacement = 'className="serif-display text-2xl sm:text-3xl lg:text-4xl font-light tracking-wider uppercase text-[#30001A] dark:text-white mb-6 whitespace-nowrap"';

auth = auth.replace(h2Target, h2Replacement);

fs.writeFileSync('src/components/AuthPage.tsx', auth);
console.log("Header and CREATE ACCOUNT text updated");
