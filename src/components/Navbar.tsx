import { motion } from 'motion/react';
import { ShoppingBag, Menu, LogOut, Sun, Moon, ShieldCheck, Heart, Truck, Search, User as UserIcon, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '../types';

interface NavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang?: 'en' | 'ar';
  onOpenCart: () => void;
  cartItemCount?: number;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
  onOpenCompare?: () => void;
  compareCount?: number;
  onOpenTrackOrder?: () => void;
  onOpenAuth: () => void;
  onOpenMenu: () => void;
  user: User | null;

  onLogout: () => void;
  onViewAdmin: () => void;
  onOpenCustomerDashboard: () => void;
}

export default function Navbar({ 
  theme, 
  onToggleTheme, 
  lang = 'en',
  onOpenCart, 
  cartItemCount = 0, 
  onOpenWishlist,
  wishlistCount = 0,
  onOpenCompare,
  compareCount = 0,
  onOpenTrackOrder,
  onOpenAuth, 
  onOpenMenu, 
  user, 
  onLogout, 
  onViewAdmin,
  onOpenCustomerDashboard
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToCollection = () => {
    const el = document.getElementById('collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-2 sm:top-5 left-2 right-2 sm:left-6 sm:right-6 z-50 max-w-6xl mx-auto transition-all duration-300"
    >
      <div 
        className={`w-full rounded-full px-2.5 xs:px-4 sm:px-8 py-2 sm:py-3.5 transition-all duration-300 relative flex items-center justify-between border backdrop-blur-2xl shadow-xl ${
          isScrolled
            ? 'bg-white/90 text-zinc-900 border-[#30001A]/20 shadow-2xl dark:bg-[#0c0508]/90 dark:text-white dark:border-white/15'
            : 'bg-white/80 text-zinc-900 border-black/10 shadow-lg dark:bg-black/70 dark:text-white dark:border-white/10'
        }`}
      >
        {/* Left Action: SHOP Dropdown & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-4 z-10 shrink-0">
          <button 
            onClick={onOpenMenu} 
            className="md:hidden p-1.5 hover:opacity-80 transition-opacity text-current cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>

          <a 
            href="#collection" 
            onClick={handleScrollToCollection}
            className="hidden md:flex items-center gap-1 text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:text-[#30001A] dark:hover:text-rose-300 transition-colors cursor-pointer"
          >
            <span>{lang === 'ar' ? 'المتجر' : 'SHOP'}</span>
            <ChevronDown size={14} strokeWidth={2} className="opacity-70" />
          </a>
        </div>

        {/* Center: Brand Logo (Absolutely Centered) */}
        <div className="absolute inset-x-0 mx-auto flex justify-center items-center text-center z-10 pointer-events-none overflow-hidden">
          <a href="#" className="inline-block text-center pointer-events-auto">
            <span className="brand-logo text-[14px] sm:text-lg md:text-xl font-black luxury-tracking tracking-[0.1em] sm:tracking-[0.25em] uppercase text-[#30001A] dark:text-white whitespace-nowrap">
              AVENTO7
            </span>
          </a>
        </div>

        {/* Right Actions: Icons ONLY (No text) */}
        <div className="flex items-center gap-0 sm:gap-2 justify-end z-10 shrink-0">
          
          {/* Search Icon Button */}
          <button
            onClick={handleScrollToCollection}
            className="hidden xs:inline-flex w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"
            title={lang === 'ar' ? 'بحث' : 'Search'}
            aria-label="Search"
          >
            <Search size={17} strokeWidth={1.8} />
          </button>

          {/* User Account / Auth Button */}
          {user ? (
            <button
              onClick={user.role === 'admin' ? onViewAdmin : onOpenCustomerDashboard}
              className="w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer relative"
              title={user.role === 'admin' ? (lang === 'ar' ? 'لوحة التحكم' : 'Admin Panel') : (lang === 'ar' ? 'حسابي' : 'Account')}
              aria-label="User account"
            >
              {user.role === 'admin' ? (
                <ShieldCheck size={18} strokeWidth={1.8} className="text-[#30001A] dark:text-rose-300" />
              ) : (
                <UserIcon size={18} strokeWidth={1.8} />
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"
              title={lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
              aria-label="Sign in"
            >
              <UserIcon size={18} strokeWidth={1.8} />
            </button>
          )}

          {/* Track Order Icon Button */}
          {onOpenTrackOrder && (
            <button
              onClick={user?.role === 'admin' ? onViewAdmin : onOpenTrackOrder}
              className="hidden sm:inline-flex w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"
              title={lang === 'ar' ? 'تتبع الشحنة' : 'Track Order'}
              aria-label="Track Order"
            >
              <Truck size={18} strokeWidth={1.8} />
            </button>
          )}

          {/* Compare Icon Button with Badge */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              title={lang === 'ar' ? 'مقارنة المنتجات' : 'Compare Products'}
              aria-label="Compare Products"
              className="hidden sm:flex w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer relative"
            >
              <div className="relative flex items-center justify-center">
                <ArrowLeftRight size={18} strokeWidth={1.8} className={compareCount > 0 ? "text-amber-500 dark:text-amber-400 font-bold" : ""} />
                {compareCount > 0 && (
                  <span className="absolute -top-2.5 -right-3 min-w-[18px] h-[18px] px-1 bg-amber-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.15)] z-10 pointer-events-none">
                    {compareCount > 99 ? '99+' : compareCount}
                  </span>
                )}
              </div>
            </button>
          )}

          {/* Wishlist Icon Button with Badge */}
          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              className="w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer relative"
              title={lang === 'ar' ? 'المفضلة' : 'Wishlist'}
              aria-label="Wishlist"
            >
              <div className="relative flex items-center justify-center">
                <Heart size={18} strokeWidth={1.8} className={wishlistCount > 0 ? "fill-[#30001A] text-[#30001A] dark:fill-rose-300 dark:text-rose-300" : ""} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2.5 -right-3 min-w-[18px] h-[18px] px-1 bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.15)] z-10 pointer-events-none">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </div>
            </button>
          )}

          {/* Cart Bag Icon Button with Badge */}
          <button
            onClick={onOpenCart}
            className="w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer relative"
            title={lang === 'ar' ? 'حقيبة التسوق' : 'Cart'}
            aria-label="Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag size={18} strokeWidth={1.8} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2.5 -right-3 min-w-[18px] h-[18px] px-1 bg-[#30001A] text-white dark:bg-rose-300 dark:text-[#30001A] text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.15)] z-10 pointer-events-none">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </div>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? (lang === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (lang === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
            aria-label="Toggle theme"
            className="hidden xs:flex w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun size={17} strokeWidth={1.8} className="text-amber-400" />
            ) : (
              <Moon size={17} strokeWidth={1.8} />
            )}
          </button>

          {/* Logout if user is logged in */}
          {user && (
            <button
              onClick={onLogout}
              className="hidden sm:inline-flex w-8 h-8 sm:w-11 sm:h-11 min-w-[32px] sm:min-w-[44px] rounded-full flex items-center justify-center shrink-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"
              title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
              aria-label="Logout"
            >
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          )}

        </div>
      </div>
    </motion.header>
  );
}

