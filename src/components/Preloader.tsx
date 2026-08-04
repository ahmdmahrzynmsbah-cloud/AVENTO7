import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function Preloader({ onComplete, lang = 'en' }: { onComplete: () => void, lang?: 'en' | 'ar' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  
  const [counter, setCounter] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const obj = { val: 0 };

      const tl = gsap.timeline({
        onComplete: () => {
          // Slide up overlay with GSAP
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 1.1,
            ease: 'power4.inOut',
            onComplete: () => {
              setIsDone(true);
              onComplete();
            },
          });
        },
      });

      // Animate percentage count
      tl.to(obj, {
        val: 100,
        duration: 2,
        ease: 'power2.out',
        onUpdate: () => setCounter(Math.floor(obj.val)),
      });

      // Animate line fill
      if (lineRef.current) {
        tl.to(lineRef.current, { scaleX: 1, duration: 2, ease: 'power2.out' }, 0);
      }

      // Fade text slightly
      if (textRef.current) {
        tl.fromTo(
          textRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
          0.2
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#fdfdfd] text-zinc-900 dark:bg-[#050505] dark:text-[#f5f5f7] flex flex-col justify-between p-8 md:p-16 select-none font-sans transition-colors duration-500"
    >
      {/* Top Header */}
      <div className="flex justify-between items-center text-[10px] luxury-tracking uppercase tracking-[0.3em] text-zinc-500 dark:text-white/50 font-medium">
        <span>{lang === 'ar' ? 'أتيلييه أفينتو 7' : 'AVENTO7 ATELIER'}</span>
        <span>{lang === 'ar' ? 'أزياء راقية 2026' : 'HAUTE COUTURE 2026'}</span>
      </div>

      {/* Center Brand Monogram */}
      <div ref={textRef} className="flex flex-col items-center justify-center text-center my-auto">
        <h1 className="brand-logo text-6xl md:text-8xl lg:text-9xl text-zinc-900 dark:text-white font-normal tracking-tight uppercase">
          AVENTO7
        </h1>
        <p className="text-[10px] luxury-tracking uppercase tracking-[0.4em] text-zinc-500 dark:text-white/60 mt-3 font-semibold">
          {lang === 'ar' ? 'باريس — طوكيو — نيويورك' : 'PARIS — TOKYO — NEW YORK'}
        </p>
      </div>

      {/* Bottom Progress Bar & Percentage */}
      <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
        <div className="w-full h-[1px] bg-black/10 dark:bg-white/10 relative overflow-hidden">
          <div
            ref={lineRef}
            className={`absolute inset-0 bg-zinc-900 dark:bg-white transform scale-x-0 ${lang === 'ar' ? 'origin-right' : 'origin-left'}`}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[10px] luxury-tracking uppercase tracking-[0.25em] text-zinc-500 dark:text-white/60 font-medium">
          <span>{lang === 'ar' ? 'جاري تجهيز التجربة' : 'LOADING EXPERIENCE'}</span>
          <span ref={counterRef} className="font-mono text-zinc-900 dark:text-white text-xs font-bold">{String(counter).padStart(3, '0')}%</span>
        </div>
      </div>
    </div>
  );
}
