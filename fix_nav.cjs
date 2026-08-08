const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

const badEndStr = "          </nav>-2.5 px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] luxury-tracking uppercase font-bold transition-all ${\n                activeTab === 'profile'\n                  ? 'bg-wine text-white dark:bg-white dark:text-wine shadow-sm'\n                  : 'text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-wine dark:hover:text-white'\n              }`}\n            >";

const replacementEndStr = "          </nav>";

if (code.includes(badEndStr)) {
  code = code.replace(badEndStr, replacementEndStr);
  console.log("Fixed part 2");
}

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
