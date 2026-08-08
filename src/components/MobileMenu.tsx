import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ArrowRight, Sun, Moon, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onViewAdmin: () => void;
  onOpenCustomerDashboard: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang?: 'en' | 'ar';
}

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  user, 
  onOpenAuth, 
  onLogout, 
  onViewAdmin,
  onOpenCustomerDashboard,
  theme,
  onToggleTheme,
  lang = 'en'
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onClose}
            className="fixed inset-0 bg-wine/60 dark:bg-wine/80 backdrop-blur-md z-[200] md:hidden"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-[400px] bg-white text-wine dark:bg-[#050505] dark:text-[#f5f5f7] border-r border-wine/10 dark:border-white/5 z-[201] flex flex-col pt-24 px-8 pb-12 shadow-2xl md:hidden overflow-y-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-wine dark:text-white/50 dark:hover:text-white transition-colors"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {/* Theme Control inside Mobile Menu */}
            <div className="mb-6 flex flex-col gap-3 pb-4 border-b border-wine/10 dark:border-white/10">
              <div className="flex justify-between items-center">
                <span className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-white/50">{lang === 'ar' ? 'المظهر' : 'THEME'}</span>
                <button
                  onClick={onToggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-wine/20 dark:border-white/20 transition-all group bg-wine/5 dark:bg-white/5"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={13} className="text-amber-400" />
                      <span className="text-[9px] luxury-tracking font-semibold text-white">{lang === 'ar' ? 'الوضع النهاري' : 'DAY MODE'}</span>
                    </>
                  ) : (
                    <>
                      <Moon size={13} className="text-wine" />
                      <span className="text-[9px] luxury-tracking font-semibold text-wine">{lang === 'ar' ? 'الوضع الليلي' : 'NIGHT MODE'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Auth Section - Top */}
            <div className="mb-8 flex flex-col w-full">
              {user ? (
                <div className="flex flex-col items-start gap-1 text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-white/50">
                  <span className="mb-2">{lang === 'ar' ? 'حالة الحساب' : 'CLIENT STATUS'}</span>
                  <div className="text-lg serif-display tracking-widest uppercase text-wine dark:text-white font-light normal-case mb-4">{user?.name || (lang === 'ar' ? 'عضو' : 'MEMBER')}</div>
                  
                  <div className="flex flex-col gap-3 mt-2 font-medium w-full text-[9px] tracking-[0.2em]">
                    {user?.role === 'admin' && (
                      <button 
                        onClick={() => { onViewAdmin(); onClose(); }} 
                        className="w-full py-3 px-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs luxury-tracking flex items-center justify-between uppercase shadow-xs mb-1"
                      >
                        <span className="flex items-center gap-2">
                          <ShieldCheck size={16} /> {lang === 'ar' ? 'لوحة التحكم' : 'ADMIN PANEL'}
                        </span>
                        <ArrowRight size={14} className="rtl:rotate-180" />
                      </button>
                    )}
                    <button 
                      onClick={() => { onOpenCustomerDashboard(); onClose(); }} 
                      className="text-left rtl:text-right w-full hover:text-wine dark:hover:text-white transition-colors flex justify-between uppercase py-1"
                    >
                      <span>{lang === 'ar' ? 'طلباتي وحسابي' : 'MY ORDERS & DASHBOARD'}</span>
                      <ArrowRight size={14} className="text-zinc-400 dark:text-white/30 rtl:rotate-180" />
                    </button>
                    <button 
                      onClick={() => { onLogout(); onClose(); }} 
                      className="text-left rtl:text-right text-zinc-500 hover:text-wine dark:text-[#86868b] dark:hover:text-white transition-colors uppercase pt-2"
                    >
                      {lang === 'ar' ? 'تسجيل الخروج' : 'SECURE LOGOUT'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 items-start w-full border-b border-wine/10 dark:border-white/10 pb-8">
                  <div className="text-[9px] luxury-tracking uppercase text-zinc-500 dark:text-white/50 tracking-[0.2em] mb-1">{lang === 'ar' ? 'بوابة العملاء' : 'CLIENT PORTAL'}</div>
                  <button 
                    onClick={() => { onOpenAuth(); onClose(); }} 
                    className="flex justify-between items-center text-left rtl:text-right w-full group py-3 text-wine hover:text-zinc-600 dark:text-white dark:hover:text-[#86868b] transition-colors"
                  >
                    <span className="text-xs luxury-tracking uppercase font-light tracking-[0.2em]">{lang === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'SIGN IN / REGISTER'}</span>
                    <ArrowRight size={18} strokeWidth={1} className="group-hover:translate-x-2 rtl:group-hover:-translate-x-2 rtl:rotate-180 transition-transform" />
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Section */}
            <div className="flex flex-col gap-10 text-4xl font-light serif-display tracking-widest uppercase mt-2">
              <a href="#collection" onClick={onClose} className="hover:text-zinc-600 dark:hover:text-white/60 transition-colors flex items-center group">
                <span className="relative">
                  {lang === 'ar' ? 'التشكيلة' : 'COLLECTION'}
                  <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-current transition-all duration-500 group-hover:w-full"></span>
                </span>
              </a>
              <a href="#collection" onClick={onClose} className="hover:text-zinc-600 dark:hover:text-white/60 transition-colors flex items-center group">
                <span className="relative">
                  {lang === 'ar' ? 'الأرشيف' : 'ARCHIVE'}
                  <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-current transition-all duration-500 group-hover:w-full"></span>
                </span>
              </a>
            </div>

            {/* Search Section */}
            <div className="mt-16 flex items-center gap-4 border-b border-wine/20 dark:border-white/20 pb-4 group mb-12">
              <Search size={18} strokeWidth={1.5} className="text-zinc-400 dark:text-white/50 group-focus-within:text-wine dark:group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder={lang === 'ar' ? 'بحث...' : 'SEARCH...'} 
                className="bg-transparent border-none outline-none text-[11px] luxury-tracking text-wine dark:text-white placeholder-zinc-400 dark:placeholder-white/30 w-full uppercase text-left rtl:text-right"
              />
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
