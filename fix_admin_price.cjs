const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

code = code.replace(
  `const parsedCost = parseFloat(costPrice) || Math.round(parsedPrice * 0.55);`,
  `const parsedCost = parseFloat(costPrice) || Math.round(parsedPrice * 0.55);\n    const parsedOriginalPrice = parseFloat(originalPrice);`
);

code = code.replace(
  `price: parsedPrice,`,
  `price: parsedPrice,\n          originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,`
);

code = code.replace(
  `price: parsedPrice,`,
  `price: parsedPrice,\n        originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,`
);

// We also need the input field!
const inputTarget = `<div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'سعر البيع (ج.م) *' : 'SELLING PRICE (EGP) *'}
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1200"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>`;

const inputReplace = `<div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'سعر البيع (ج.م) *' : 'SELLING PRICE (EGP) *'}
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1200"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'السعر الاصلي (لإظهار خصم)' : 'ORIGINAL PRICE (FOR DISCOUNT)'}
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="1500"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>`;
                  
code = code.replace(inputTarget, inputReplace);
// Also change the grid-cols from 3 to 4 so it looks okay.
code = code.replace(
  `{/* Pricing & Stock Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">`,
  `{/* Pricing & Stock Row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">`
);

fs.writeFileSync('src/components/AdminPanel.tsx', code);
