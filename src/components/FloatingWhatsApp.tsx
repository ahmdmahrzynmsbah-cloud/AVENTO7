import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  lang?: 'en' | 'ar';
}

export default function FloatingWhatsApp({ 
  phoneNumber = '2001022293420', 
  lang = 'ar' 
}: FloatingWhatsAppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  const formattedUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    lang === 'ar' ? 'مرحباً، أود الاستفسار عن منتجات AVENTO7' : 'Hello, I would like to inquire about AVENTO7 products'
  )}`;

  return (
    <div className="fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto select-none rtl:right-auto rtl:left-4 rtl:sm:left-6 pb-safe">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-72 bg-white dark:bg-[#0d0d0d] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden text-zinc-900 dark:text-white"
          >
            {/* Header */}
            <div className="bg-emerald-600 dark:bg-emerald-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center font-serif font-bold text-lg text-white">
                    A7
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-emerald-600 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider">{lang === 'ar' ? 'دعم أفينتو 7' : 'AVENTO7 SUPPORT'}</h4>
                  <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                    {lang === 'ar' ? 'متواجدون الآن للخدمة' : 'Online & ready to help'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body snippet */}
            <div className="p-4 bg-zinc-50 dark:bg-[#121212] text-xs space-y-3">
              <div className="bg-white dark:bg-[#1e1e1e] border border-black/5 dark:border-white/5 p-3 rounded-xl shadow-xs text-zinc-700 dark:text-zinc-300 leading-relaxed text-[11px] rtl:text-right">
                {lang === 'ar' 
                  ? 'أهلاً بك في AVENTO7 👋 كيف يمكننا مساعدتك اليوم؟ اضغط بالأسفل للبدء بالدردشة مباشرة عبر واتساب.' 
                  : 'Welcome to AVENTO7 👋 How can we help you today? Click below to chat directly with our team on WhatsApp.'}
              </div>
              
              <a
                href={formattedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setShowBadge(false);
                  setIsOpen(false);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-xs cursor-pointer"
              >
                <MessageCircle size={16} />
                <span>{lang === 'ar' ? 'بدء المحادثة على واتساب' : 'Start WhatsApp Chat'}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button with Pulse Animations */}
      <div className="relative group">
        {/* Pulsing Ripple Rings */}
        <span className="absolute -inset-2 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping opacity-75"></span>
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-sm"></span>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen(!isOpen);
            setShowBadge(false);
          }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-2xl cursor-pointer z-10 border border-white/20 focus:outline-none"
          aria-label="WhatsApp Support"
        >
          <MessageCircle size={28} className="drop-shadow-md" />

          {/* Unread badge */}
          {showBadge && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-black animate-bounce shadow-md">
              1
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
