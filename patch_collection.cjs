const fs = require('fs');
let code = fs.readFileSync('src/components/Collection.tsx', 'utf8');

const targetStart = `              return (
                <motion.div
                  layout`;

const targetEnd = `                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>`;

const startIndex = code.indexOf(targetStart);
const endIndex = code.indexOf(targetEnd, startIndex) + targetEnd.length;

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find boundaries");
    process.exit(1);
}

const replacement = `              return (
                <motion.div
                  layout
                  key={\`\${product.id}-grid-\${idx}\`}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="group h-full flex flex-col justify-between bg-white dark:bg-[#0c060a]/80 border border-black/10 dark:border-white/10 rounded-[22px] p-4 hover:border-amber-500/50 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden relative"
                  onClick={() => onViewProduct?.(product)}
                >
                  <div className="flex flex-col w-full">
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-[#0A0A0A] mb-3 sm:mb-4 rounded-xl border border-black/5 dark:border-white/5 shrink-0">
                      {/* Primary Product Image */}
                      <img 
                        src={product.images && product.images.length > 0 ? product.images[0] : product.image} 
                        alt={product.name} 
                        className={\`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:scale-105 \${
                          product.isSoldOut ? 'grayscale-[20%] opacity-80 group-hover:opacity-90' : 'opacity-95 group-hover:opacity-100'
                        }\`} 
                        referrerPolicy="no-referrer" 
                      />
                      {/* Secondary Product Image Crossfade on Hover */}
                      {product.images && product.images.length > 1 && (
                        <img 
                          src={product.images[1]} 
                          alt={\`\${product.name} alternate\`} 
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-105 hidden sm:block" 
                          referrerPolicy="no-referrer" 
                        />
                      )}
                      <div className="absolute inset-0 bg-black/5 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      
                      {/* Multi-Image Count Badge - Bottom Left */}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-2 left-2 z-10 text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-black/70 text-white backdrop-blur-md rounded-md border border-white/20 flex items-center gap-1 shadow-xs">
                          <Layers size={10} className="text-amber-400" />
                          <span>{product.images.length}</span>
                        </div>
                      )}

                      {/* Top Overlay Flex Container (Avoid Overlap) */}
                      <div className="absolute top-0 left-0 w-full p-2 flex items-start justify-between z-20 pointer-events-none">
                        {/* Left: Badges */}
                        <div className="flex flex-col gap-1 items-start">
                          {product.isSoldOut ? (
                            <div className="text-[8px] sm:text-[9px] luxury-tracking px-2 py-0.5 border border-rose-500/40 bg-rose-950/85 text-rose-200 backdrop-blur-md uppercase font-bold tracking-widest shadow-md flex items-center gap-1 rounded-md pointer-events-auto">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                              {isRTL ? 'نفذت' : 'SOLD OUT'}
                            </div>
                          ) : product.isNew ? (
                            <div className="text-[8px] sm:text-[9px] luxury-tracking px-2 py-0.5 border border-black/10 dark:border-white/20 bg-black/70 text-white backdrop-blur-md uppercase font-semibold rounded-md pointer-events-auto">
                              {isRTL ? 'جديد' : 'NEW'}
                            </div>
                          ) : <div />}
                        </div>
                        
                        {/* Right Action Group: Compare & Wishlist */}
                        <div className="flex items-center gap-2 pointer-events-auto">
                          {/* Compare Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleCompare?.(product);
                            }}
                            className={\`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all \${
                              isCompared
                                ? 'bg-amber-400 text-zinc-950 font-bold shadow-md scale-105'
                                : 'bg-black/40 text-white hover:bg-amber-400 hover:text-zinc-950 backdrop-blur-md border border-white/20 active:scale-95'
                            }\`}
                            title={isRTL ? 'مقارنة' : 'Compare'}
                            aria-label="Toggle compare"
                          >
                            <ArrowLeftRight size={14} />
                          </button>
                          {/* Wishlist Heart Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist?.(product.id);
                            }}
                            className={\`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center transition-all \${
                              isWishlisted
                                ? 'bg-[#30001A] text-white shadow-md scale-105'
                                : 'bg-black/40 text-white hover:bg-[#30001A] backdrop-blur-md border border-white/20 active:scale-95'
                            }\`}
                            aria-label="Toggle wishlist"
                          >
                            <Heart size={14} className={isWishlisted ? 'fill-white' : ''} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Title & Category */}
                    <div className="px-1 flex-1">
                      <h3 className="text-[16px] font-semibold luxury-tracking text-zinc-900 dark:text-white mb-1 line-clamp-2 leading-tight group-hover:text-amber-600 dark:group-hover:text-rose-300 transition-colors min-h-[2rem]">
                        {isRTL && product.nameAr ? product.nameAr : product.name}
                      </h3>
                    </div>
                  </div>

                  {/* Bottom Area */}
                  <div className="flex flex-col gap-3 mt-3 w-full">
                    {/* Price & Rating Section */}
                    <div className="px-1 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1.5 w-full">
                      <span className="text-[22px] font-mono font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none whitespace-nowrap">
                        {product.price.toLocaleString()} <span className="text-sm ml-0.5">{isRTL ? 'ج.م' : 'EGP'}</span>
                      </span>
                      {product.rating && (
                        <div className="flex items-center gap-1 text-[#d4af37] text-[15px] font-bold shrink-0">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span>{product.rating}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick View / Notify Overlay Button (Full width at bottom) */}
                    <div className="w-full">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewProduct?.(product);
                        }}
                        className={\`w-full py-2 px-2 text-[10px] sm:text-[11px] luxury-tracking font-bold transition-all uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-2 rounded-xl min-h-[44px] \${
                          product.isSoldOut 
                            ? 'bg-zinc-900 text-amber-300 hover:bg-black border border-amber-500/30' 
                            : 'bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] hover:opacity-90'
                        }\`}
                      >
                        {product.isSoldOut ? (
                          <>
                            <Bell size={14} className="text-amber-400 animate-bounce shrink-0" />
                            <span className="truncate">{isRTL ? 'أبلغني بالتوفر' : 'NOTIFY ME'}</span>
                          </>
                        ) : (
                          <>
                            <Eye size={14} className="shrink-0" />
                            <span className="truncate">{isRTL ? 'نظرة سريعة' : 'QUICK VIEW'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/components/Collection.tsx', code);
console.log("Done");
