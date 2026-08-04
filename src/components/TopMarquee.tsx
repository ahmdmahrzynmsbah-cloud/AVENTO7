import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function TopMarquee({ offers, lang = 'en' }: { offers: string[], lang?: 'en' | 'ar' }) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!marqueeRef.current || !offers || offers.length === 0) return;

    const ctx = gsap.context(() => {
      // Create infinite smooth continuous ticker using GSAP
      tweenRef.current = gsap.to(marqueeRef.current, {
        xPercent: -50,
        repeat: -1,
        duration: Math.max(15, offers.length * 8),
        ease: 'none',
      });
    });

    return () => ctx.revert();
  }, [offers]);

  if (!offers || offers.length === 0) return null;

  return (
    <div 
      className="w-full bg-[#30001A] text-white py-3.5 border-y border-[#30001A]/30 overflow-hidden flex whitespace-nowrap z-20 relative select-none shadow-md"
      onMouseEnter={() => tweenRef.current?.timeScale(0.3)}
      onMouseLeave={() => tweenRef.current?.timeScale(1)}
    >
      <div 
        ref={marqueeRef}
        className="flex gap-8 items-center font-mono text-[10px] uppercase tracking-[0.25em] text-white/90 font-light"
      >
        {/* Duplicated array for 100% seamless infinite scroll loop */}
        {[...Array(6)].map((_, loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-8 shrink-0">
            {offers.map((offer, idx) => (
              <div key={`${loopIdx}-${idx}`} className="flex items-center gap-8">
                <span className="hover:text-rose-200 transition-colors duration-300 font-medium">
                  {offer}
                </span>
                <span className="text-rose-300/60 text-[8px] font-thin">✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
