const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// The 4 columns in the pricing & stock row:
// 1. Selling Price
// 2. Original Price
// 3. Cost Price
// 4. Stock Qty

const blockTarget = `<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1">
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
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'سعر التكلفة (ج.م)' : 'COST PRICE (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="650"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'كمية المخزون' : 'STOCK QTY'}
                    </label>
                    <input
                      type="number"
                      value={stockInput}
                      onChange={(e) => setStockInput(e.target.value)}
                      placeholder="25"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>`;

const blockReplace = `<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col h-full gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 min-h-[2rem] flex items-end">
                      {lang === 'ar' ? 'سعر البيع (ج.م) *' : 'SELLING PRICE (EGP) *'}
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1200"
                      className="mt-auto w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col h-full gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 min-h-[2rem] flex items-end leading-tight">
                      {lang === 'ar' ? 'السعر الاصلي (لخصم)' : 'ORIGINAL PRICE (DISCOUNT)'}
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="1500"
                      className="mt-auto w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col h-full gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 min-h-[2rem] flex items-end">
                      {lang === 'ar' ? 'سعر التكلفة (ج.م)' : 'COST PRICE (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="650"
                      className="mt-auto w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col h-full gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 min-h-[2rem] flex items-end">
                      {lang === 'ar' ? 'كمية المخزون' : 'STOCK QTY'}
                    </label>
                    <input
                      type="number"
                      value={stockInput}
                      onChange={(e) => setStockInput(e.target.value)}
                      placeholder="25"
                      className="mt-auto w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>`;

code = code.replace(blockTarget, blockReplace);
fs.writeFileSync('src/components/AdminPanel.tsx', code);
