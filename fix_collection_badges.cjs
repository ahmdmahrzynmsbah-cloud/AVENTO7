const fs = require('fs');
let code = fs.readFileSync('src/components/Collection.tsx', 'utf8');

const t1 = `                      ) : product.isNew ? (
                        <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 text-[8px] luxury-tracking px-1.5 py-0.5 border border-black/10 dark:border-white/20 bg-black/70 text-white uppercase font-semibold rounded">
                          {isRTL ? 'جديد' : 'NEW'}
                        </div>
                      ) : null}`;
const r1 = `                      ) : product.originalPrice && product.originalPrice > product.price ? (
                        <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 text-[8px] luxury-tracking px-1.5 py-0.5 border border-rose-500/30 bg-rose-600/90 text-white uppercase font-bold rounded shadow-sm">
                          {isRTL ? 'خصم' : 'SALE'} {Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </div>
                      ) : product.isNew ? (
                        <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 z-10 text-[8px] luxury-tracking px-1.5 py-0.5 border border-black/10 dark:border-white/20 bg-black/70 text-white uppercase font-semibold rounded">
                          {isRTL ? 'جديد' : 'NEW'}
                        </div>
                      ) : null}`;

code = code.replace(t1, r1);

const t2 = `                          ) : product.isNew ? (
                            <div className="text-[8px] sm:text-[9px] luxury-tracking px-2 py-0.5 border border-black/10 dark:border-white/20 bg-black/70 text-white backdrop-blur-md uppercase font-semibold rounded-md pointer-events-auto">
                              {isRTL ? 'جديد' : 'NEW'}
                            </div>
                          ) : <div />}`;
const r2 = `                          ) : product.originalPrice && product.originalPrice > product.price ? (
                            <div className="text-[8px] sm:text-[9px] luxury-tracking px-2 py-0.5 border border-rose-500/30 bg-rose-600/90 text-white backdrop-blur-md uppercase font-bold tracking-widest shadow-md flex items-center gap-1 rounded-md pointer-events-auto">
                              {isRTL ? 'خصم' : 'SALE'} {Math.round((1 - product.price / product.originalPrice) * 100)}%
                            </div>
                          ) : product.isNew ? (
                            <div className="text-[8px] sm:text-[9px] luxury-tracking px-2 py-0.5 border border-black/10 dark:border-white/20 bg-black/70 text-white backdrop-blur-md uppercase font-semibold rounded-md pointer-events-auto">
                              {isRTL ? 'جديد' : 'NEW'}
                            </div>
                          ) : <div />}`;

code = code.replace(t2, r2);

fs.writeFileSync('src/components/Collection.tsx', code);
