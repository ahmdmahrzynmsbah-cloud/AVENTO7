const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

const targetStr = `<span className="text-[10px] sm:text-[11px] luxury-tracking text-zinc-500 dark:text-whit          <nav className="bg-white dark:bg-[#0A0A0A] border border-wine/10 dark:border-white/10 p-1.5 sm:p-2 flex overflow-x-auto hide-scrollbar lg:flex-col gap-1.5 shadow-sm scroll-smooth">`;

const replacementStr = `<span className="text-[10px] sm:text-[11px] luxury-tracking text-zinc-500 dark:text-white/40 font-mono truncate">{user?.email || ''}</span>
              </div>
            </div>

            <div className="border-t border-wine/5 dark:border-white/5 pt-3 text-[10px] luxury-tracking flex justify-between items-center text-zinc-500 dark:text-white/50">
              <span className="font-semibold">PHONE NUMBER:</span>
              <span className="font-mono font-bold text-wine dark:text-white">{user.phone || 'NOT PROVIDED'}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="bg-white dark:bg-[#0A0A0A] border border-wine/10 dark:border-white/10 p-1.5 sm:p-2 flex overflow-x-auto hide-scrollbar lg:flex-col gap-1.5 shadow-sm scroll-smooth">`;

code = code.replace(targetStr, replacementStr);

const endTargetStr = `          </nav>
              <UserIcon size={15} />
              <span className="truncate">SETTINGS</span>
            </button>
          </nav>`;
code = code.replace(endTargetStr, `          </nav>`);

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
