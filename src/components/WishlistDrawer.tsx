import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product, User } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size?: string) => void;
  currentUser?: User | null;
  onViewAdmin?: () => void;
  lang?: 'en' | 'ar';
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems,
  onRemoveFromWishlist,
  onAddToCart,
  lang = 'en'
}: WishlistDrawerProps) {
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

          {/* Side Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white text-zinc-900 dark:bg-[#080808] dark:text-white z-[90] shadow-2xl flex flex-col border-l border-black/10 dark:border-white/10"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-amber-500 fill-amber-500" />
                <h2 className="text-sm luxury-tracking font-bold uppercase tracking-[0.2em]">
                  {lang === 'ar' ? `قائمة المفضلات (${wishlistItems.length})` : `WISHLIST (${wishlistItems.length})`}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Close Wishlist"
              >
                <X size={20} />
              </button>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlistItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4 text-zinc-400 dark:text-white/40">
                  <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10">
                    <Heart size={28} strokeWidth={1.2} />
                  </div>
                  <p className="text-xs uppercase luxury-tracking tracking-[0.15em] max-w-[200px]">
                    {lang === 'ar' ? 'قائمة المفضلات فارغة حالياً' : 'YOUR WISHLIST IS EMPTY'}
                  </p>
                </div>
              ) : (
                wishlistItems.map((product, idx) => (
                  <div
                    key={`${product.id}-${idx}`}
                    className="flex gap-4 p-3 border border-black/10 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5 relative group"
                  >
                    <div className="w-20 h-24 bg-zinc-100 dark:bg-black shrink-0 overflow-hidden relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <div>
                        <h3 className="text-xs uppercase font-bold text-zinc-900 dark:text-white truncate">
                          {lang === 'ar' ? (product.nameAr || product.name) : product.name}
                        </h3>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-1 block">
                          {product.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            if (product.isSoldOut) return;
                            onAddToCart(product, product.sizes?.[0] || 'M');
                            onRemoveFromWishlist(product.id);
                          }}
                          disabled={product.isSoldOut}
                          className={`flex-1 py-2 font-bold uppercase text-[9px] luxury-tracking transition-colors flex items-center justify-center gap-1.5 ${
                            product.isSoldOut
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 cursor-not-allowed'
                              : 'bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-white/80 cursor-pointer'
                          }`}
                        >
                          <ShoppingBag size={12} />
                          <span>{product.isSoldOut ? (lang === 'ar' ? 'نفذت الكمية' : 'SOLD OUT') : (lang === 'ar' ? 'نقل للسلة' : 'MOVE TO CART')}</span>
                        </button>

                        <button
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="p-2 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title={lang === 'ar' ? 'إزالة من المفضلات' : 'Remove from wishlist'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlistItems.length > 0 && (
              <div className="p-6 border-t border-black/10 dark:border-white/10 bg-zinc-50 dark:bg-[#050505]">
                <button
                  onClick={() => {
                    wishlistItems.forEach((p) => onAddToCart(p, p.sizes?.[0] || 'M'));
                    wishlistItems.forEach((p) => onRemoveFromWishlist(p.id));
                  }}
                  className="w-full py-4 bg-amber-500 text-black font-bold uppercase text-[10px] luxury-tracking tracking-[0.2em] hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <ShoppingBag size={16} />
                  <span>{lang === 'ar' ? 'نقل جميع العناصر للسلة' : 'ADD ALL TO CART'}</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
