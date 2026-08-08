import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function ScrollProgress() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollPercent(0);
        setIsVisible(false);
        return;
      }
      const currentScroll = window.scrollY;
      const percentage = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setScrollPercent(percentage);
      
      // Show widget once user has scrolled past 30px
      setIsVisible(currentScroll > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG Circle dimensions
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercent / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-24 right-6 sm:bottom-28 sm:right-8 z-40 rtl:right-auto rtl:left-6 sm:rtl:left-8 pointer-events-auto select-none"
        >
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={scrollToTop}
            title="KM - Top"
            aria-label="Scroll to top"
            className="relative w-14 h-14 rounded-full bg-white/90 dark:bg-[#0c0508]/90 backdrop-blur-2xl border border-[#30001A]/20 dark:border-white/20 shadow-2xl flex items-center justify-center cursor-pointer group focus:outline-none transition-shadow hover:shadow-[#30001A]/30"
          >
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90 transform rounded-full p-1" viewBox="0 0 52 52">
              {/* Background Track Circle */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="stroke-black/10 dark:stroke-white/10"
                strokeWidth="2.5"
                fill="transparent"
              />
              {/* Dynamic Progress Circle */}
              <circle
                cx="26"
                cy="26"
                r={radius}
                className="stroke-[#30001A] dark:stroke-rose-300 transition-all duration-150 ease-out"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Brand Abbreviation Text KM */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="brand-logo text-xs sm:text-sm font-black tracking-widest uppercase text-[#30001A] dark:text-white drop-shadow-xs group-hover:scale-105 transition-transform">
                KM
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
