const fs = require('fs');
let code = fs.readFileSync('src/components/ProductModal.tsx', 'utf8');

const target = `              {/* Sold Out Badge */}
              {product.isSoldOut && (
                <div className="absolute top-4 left-4 z-10 text-[10px] luxury-tracking px-3 py-1.5 border border-rose-500/50 bg-rose-950/90 text-rose-200 backdrop-blur-md uppercase font-bold tracking-widest shadow-2xl flex items-center gap-1.5 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {lang === 'ar' ? 'نفذت الكمية (SOLD OUT)' : 'SOLD OUT'}
                </div>
              )}`;
              
const replace = `              {/* Status Badges */}
              {product.isSoldOut ? (
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 text-[10px] luxury-tracking px-3 py-1.5 border border-rose-500/50 bg-rose-950/90 text-rose-200 backdrop-blur-md uppercase font-bold tracking-widest shadow-2xl flex items-center gap-1.5 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {lang === 'ar' ? 'نفذت الكمية (SOLD OUT)' : 'SOLD OUT'}
                </div>
              ) : product.originalPrice && product.originalPrice > product.price ? (
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 text-[10px] luxury-tracking px-3 py-1.5 border border-rose-500/30 bg-rose-600/90 text-white backdrop-blur-md uppercase font-bold shadow-md rounded-md">
                  {lang === 'ar' ? 'خصم' : 'SALE'} {Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              ) : product.isNew ? (
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 text-[10px] luxury-tracking px-3 py-1.5 border border-black/10 dark:border-white/20 bg-black/70 text-white backdrop-blur-md uppercase font-semibold rounded-md">
                  {lang === 'ar' ? 'جديد' : 'NEW'}
                </div>
              ) : null}`;

code = code.replace(target, replace);
fs.writeFileSync('src/components/ProductModal.tsx', code);
