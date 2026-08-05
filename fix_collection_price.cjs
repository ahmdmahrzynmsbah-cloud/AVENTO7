const fs = require('fs');
let code = fs.readFileSync('src/components/Collection.tsx', 'utf8');

const target1 = `{product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}`;
const replace1 = `{product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-zinc-400 dark:text-zinc-500 line-through text-[10px] ml-1 rtl:mr-1 rtl:ml-0">
                                {product.originalPrice.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                              </span>
                            )}`;
                            
const target2 = `{product.price.toLocaleString()} <span className="text-sm ml-0.5">{isRTL ? 'ج.م' : 'EGP'}</span>`;
const replace2 = `{product.price.toLocaleString()} <span className="text-sm ml-0.5">{isRTL ? 'ج.م' : 'EGP'}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-zinc-400 dark:text-zinc-500 line-through text-sm font-medium ml-2 rtl:mr-2 rtl:ml-0">
                            {product.originalPrice.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                          </span>
                        )}`;

code = code.replace(target1, replace1);
code = code.replace(target2, replace2);

// Let's add a discount tag on the product card image
const discountTarget = `{product.isNew && (
                        <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto bg-[#30001A] dark:bg-white text-white dark:text-[#30001A] text-[9px] font-bold uppercase luxury-tracking px-2 py-1 rounded-full z-10">
                          {isRTL ? 'جديد' : 'NEW'}
                        </div>
                      )}`;
const discountReplace = `{product.originalPrice && product.originalPrice > product.price && (
                        <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto bg-rose-600 text-white text-[9px] font-bold uppercase luxury-tracking px-2 py-1 rounded-full z-10 shadow-sm">
                          {isRTL ? 'خصم' : 'SALE'} {Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-2 left-2 rtl:right-2 rtl:left-auto bg-[#30001A] dark:bg-white text-white dark:text-[#30001A] text-[9px] font-bold uppercase luxury-tracking px-2 py-1 rounded-full z-10 shadow-sm">
                          {isRTL ? 'جديد' : 'NEW'}
                        </div>
                      )}`;
code = code.replace(discountTarget, discountReplace);                      

fs.writeFileSync('src/components/Collection.tsx', code);
