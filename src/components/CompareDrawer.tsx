import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeftRight, Trash2, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product, User } from '../types';

interface CompareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onOpenCompareModal: () => void;
  onAddToCart: (product: Product, size?: string) => void;
  onViewProduct?: (product: Product) => void;
  currentUser?: User | null;
  onViewAdmin?: () => void;
  lang?: 'en' | 'ar';
}

export default function CompareDrawer({
  isOpen,
  onClose,
  comparedProducts,
  onRemoveProduct,
  onClearAll,
  onOpenCompareModal,
  onAddToCart,
  onViewProduct,
  lang = 'en'
}: CompareDrawerProps) {
  const isRTL = lang === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[80]"
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: isRTL ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed top-0 bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-full sm:w-[440px] bg-white text-zinc-900 dark:bg-[#09090b] dark:text-white z-[90] shadow-2xl flex flex-col border-x border-black/10 dark:border-white/10`}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-400/15 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <ArrowLeftRight size={18} />
                </div>
                <div>
                  <h2 className="text-xs luxury-tracking font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
                    {isRTL ? `مقارنة المنتجات (${comparedProducts.length}/4)` : `COMPARE PRODUCTS (${comparedProducts.length}/4)`}
                  </h2>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {isRTL ? 'اختر حتى 4 منتجات لمقارنة المواصفات' : 'Select up to 4 items for side-by-side comparison'}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Close Compare Drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Products List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {comparedProducts.length === 0 ? (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-zinc-400 dark:text-zinc-500 shadow-inner">
                    <ArrowLeftRight size={32} strokeWidth={1.3} />
                  </div>
                  
                  <div className="max-w-[280px] space-y-2">
                    <h3 className="text-xs uppercase luxury-tracking font-bold tracking-[0.15em] text-zinc-900 dark:text-white">
                      {isRTL ? 'لا توجد منتجات للمقارنة' : 'NO PRODUCTS IN COMPARE LIST'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {isRTL
                        ? 'انقر على أيقونة المقارنة على أي منتج في المتجر لإضافة حتى 4 منتجات ومقارنة الأسعار والمواصفات.'
                        : 'Click the compare icon on any product in the store to add up to 4 items and evaluate their specifications side-by-side.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      const element = document.getElementById('collection');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="mt-2 px-6 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[11px] uppercase tracking-wider font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    {isRTL ? 'استعرض التشكيلة' : 'BROWSE COLLECTION'}
                  </button>
                </div>
              ) : (
                /* Product Cards */
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {comparedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex gap-4 p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-zinc-50/80 dark:bg-white/5 relative group hover:border-amber-500/50 transition-all shadow-xs"
                      >
                        {/* Thumbnail */}
                        <div 
                          onClick={() => {
                            onViewProduct?.(product);
                            onClose();
                          }}
                          className="w-20 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0 overflow-hidden relative cursor-pointer group-hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={16} className="text-white drop-shadow-md" />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 
                                onClick={() => {
                                  onViewProduct?.(product);
                                  onClose();
                                }}
                                className="text-xs uppercase font-bold text-zinc-900 dark:text-white truncate cursor-pointer hover:text-amber-500 transition-colors"
                              >
                                {isRTL ? (product.nameAr || product.name) : product.name}
                              </h3>
                              
                              <button
                                onClick={() => onRemoveProduct(product.id)}
                                className="p-1 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                                title={isRTL ? 'إزالة' : 'Remove from compare'}
                                aria-label="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                              {product.gender || 'UNISEX'} {product.category ? `• ${product.category}` : ''}
                            </p>

                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                                {product.price.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                              </span>
                              {product.originalPrice && (
                                <span className="text-[10px] font-mono text-zinc-400 line-through">
                                  {product.originalPrice.toLocaleString()} {isRTL ? 'ج.م' : 'EGP'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => {
                                if (!product.isSoldOut) {
                                  onAddToCart(product, product.sizes?.[0] || 'M');
                                }
                              }}
                              disabled={product.isSoldOut}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                product.isSoldOut
                                  ? 'bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-white/30 cursor-not-allowed'
                                  : 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:opacity-90'
                              }`}
                            >
                              <ShoppingBag size={12} />
                              <span>{product.isSoldOut ? (isRTL ? 'نفذت الكمية' : 'SOLD OUT') : (isRTL ? 'إضافة للحقيبة' : 'ADD TO BAG')}</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Drawer Footer / Compare Now CTA */}
            {comparedProducts.length > 0 && (
              <div className="p-6 border-t border-black/10 dark:border-white/10 bg-zinc-50/80 dark:bg-zinc-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>
                    {isRTL 
                      ? `${comparedProducts.length} من أصل 4 منتجات محددة` 
                      : `${comparedProducts.length} of 4 items selected`}
                  </span>
                  <button
                    onClick={onClearAll}
                    className="text-[11px] text-rose-500 dark:text-rose-400 hover:underline font-medium cursor-pointer"
                  >
                    {isRTL ? 'مسح الكل' : 'Clear All'}
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCompareModal();
                  }}
                  className="w-full py-4 rounded-xl bg-amber-400 text-zinc-950 hover:bg-amber-300 font-extrabold text-xs uppercase tracking-widest shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <ArrowLeftRight size={16} />
                  <span>
                    {isRTL
                      ? `مقارنة المنتجات الآن (${comparedProducts.length})`
                      : `COMPARE NOW (${comparedProducts.length} ${comparedProducts.length === 1 ? 'PRODUCT' : 'PRODUCTS'})`}
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
