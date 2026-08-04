const fs = require('fs');
let code = fs.readFileSync('src/components/ProductToolbar.tsx', 'utf8');

code = code.replace(
  '      <div className="w-full bg-white/90 dark:bg-[#0c060a]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-2.5 sm:p-3.5 shadow-lg transition-all duration-300">',
  '      <div className="w-full bg-white/90 dark:bg-[#0c060a]/90 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-[22px] p-2 sm:p-3.5 shadow-lg transition-all duration-300">'
);

code = code.replace(
  '        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">',
  '        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">'
);

// Filter button and search:
code = code.replace(
  '          <div className="flex items-center gap-2 sm:gap-3 flex-1">',
  '          <div className="flex items-center gap-2 sm:gap-3 flex-1 w-full md:w-auto">'
);

// We need to change the button from flex-1 or w-auto to w-[45%]
code = code.replace(
  'className={`relative min-h-[44px] px-3.5 sm:px-4',
  'className={`relative min-h-[44px] w-[45%] md:w-auto px-2 sm:px-4'
);

// Search from flex-1 to w-[55%]
code = code.replace(
  '            <div className="relative flex-1 min-h-[44px] flex items-center">',
  '            <div className="relative w-[55%] md:flex-1 min-h-[44px] flex items-center">'
);

// Sort and view mode layout
code = code.replace(
  '          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0">',
  '          <div className="flex flex-wrap md:flex-nowrap items-center justify-between md:justify-end gap-2 sm:gap-3 shrink-0">'
);

code = code.replace(
  '            <div className="relative flex-1 md:flex-none min-h-[44px] flex items-center bg-zinc-100/80 dark:bg-white/10 border border-black/10 dark:border-white/15 rounded-xl px-3 py-1 hover:border-amber-500/50 transition-colors">',
  '            <div className="relative w-full md:w-auto md:flex-none min-h-[44px] flex items-center bg-zinc-100/80 dark:bg-white/10 border border-black/10 dark:border-white/15 rounded-xl px-3 py-1 hover:border-amber-500/50 transition-colors">'
);

code = code.replace(
  '            <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-white/10 p-1 rounded-xl border border-black/10 dark:border-white/15 shrink-0" role="radiogroup"',
  '            <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-white/10 p-1 rounded-xl border border-black/10 dark:border-white/15 shrink-0 ml-auto rtl:mr-auto rtl:ml-0" role="radiogroup"'
);

fs.writeFileSync('src/components/ProductToolbar.tsx', code);
console.log("Toolbar patched");
