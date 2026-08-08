const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

const targetStr = `        {/* SIDEBAR MENU (Fixed/Static on Desktop, Segmented Mobile Layout) */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5 lg:h-full lg:overflow-y-auto custom-scrollbar">
          
          {/* Client Profile Summary Card */}`;

const replacementStr = `        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR MENU */}
        <aside className={\`
          fixed lg:static inset-y-0 \${lang === 'ar' ? 'right-0' : 'left-0'} z-[110] w-[85vw] sm:w-80 lg:w-80 
          bg-[#fcfcfc] dark:bg-[#050505] lg:bg-transparent lg:dark:bg-transparent
          flex-shrink-0 flex flex-col gap-5 lg:h-full lg:overflow-y-auto custom-scrollbar
          border-x border-wine/10 dark:border-white/10 lg:border-none shadow-2xl lg:shadow-none
          transition-transform duration-300 ease-in-out p-5 lg:p-0
          \${isSidebarOpen ? 'translate-x-0' : (lang === 'ar' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
        \`}>
          
          <div className="flex justify-between items-center lg:hidden mb-2">
            <span className="text-xs luxury-tracking font-bold uppercase text-wine dark:text-white">{lang === 'ar' ? 'القائمة الرئيسية' : 'MAIN MENU'}</span>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-zinc-500 hover:text-wine dark:hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Client Profile Summary Card */}`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
