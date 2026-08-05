const fs = require('fs');
let code = fs.readFileSync('src/components/ProductModal.tsx', 'utf8');

const target = `<span className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">{product.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>`;
const replace = `<div className="flex items-end gap-2">
                  <span className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">{product.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm font-medium line-through text-zinc-400 mb-[2px]">
                      {product.originalPrice.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  )}
                </div>`;
                
code = code.replace(target, replace);

// Add discount tag to the modal image
const imgTarget = `{product.isNew && (
                  <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto bg-[#30001A] dark:bg-white text-white dark:text-[#30001A] text-[10px] font-bold uppercase luxury-tracking px-2.5 py-1 rounded-full z-10">
                    {lang === 'ar' ? 'جديد' : 'NEW'}
                  </div>
                )}`;
const imgReplace = `{product.originalPrice && product.originalPrice > product.price && (
                  <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto bg-rose-600 text-white text-[10px] font-bold uppercase luxury-tracking px-2.5 py-1 rounded-full z-10 shadow-md">
                    {lang === 'ar' ? 'خصم' : 'SALE'} {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto bg-[#30001A] dark:bg-white text-white dark:text-[#30001A] text-[10px] font-bold uppercase luxury-tracking px-2.5 py-1 rounded-full z-10">
                    {lang === 'ar' ? 'جديد' : 'NEW'}
                  </div>
                )}`;
code = code.replace(imgTarget, imgReplace);                

fs.writeFileSync('src/components/ProductModal.tsx', code);
