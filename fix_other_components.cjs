const fs = require('fs');

function fix(file) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    const t1 = `{product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}`;
    const r1 = `{product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-zinc-400 dark:text-zinc-500 line-through text-[10px] ml-1 rtl:mr-1 rtl:ml-0">
                                    {product.originalPrice.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                                  </span>
                                )}`;
    code = code.replace(t1, r1);
    
    const t2 = `{product.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}`;
    const r2 = `{product.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-zinc-400 dark:text-zinc-500 line-through text-[10px] ml-1 rtl:mr-1 rtl:ml-0">
                              {product.originalPrice.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                            </span>
                          )}`;
    code = code.replace(t2, r2);
    
    fs.writeFileSync(file, code);
  }
}

fix('src/components/CompareDrawer.tsx');
fix('src/components/WishlistDrawer.tsx');
