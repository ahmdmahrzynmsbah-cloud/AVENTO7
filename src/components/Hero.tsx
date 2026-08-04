import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ images, lang = 'en' }: { images: string[], lang?: 'en' | 'ar' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    if (!images || images.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images]);

  // GSAP Parallax on Scroll
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // GSAP Parallax on Scroll
      gsap.to(containerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        y: 120,
        opacity: 0.8,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // GSAP slide transition for active image
  useEffect(() => {
    const activeImg = imageRefs.current[currentIndex];
    if (!activeImg) return;

    gsap.fromTo(
      activeImg,
      { scale: 1.12, opacity: 0.4 },
      { scale: 1, opacity: 0.9, duration: 1.8, ease: 'power2.out' }
    );
  }, [currentIndex]);

  if (!images || images.length === 0) return null;

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[100svh] min-h-[500px] sm:min-h-[600px] flex items-center justify-center overflow-hidden bg-[#fcfcfc] dark:bg-[#050505] select-none transition-colors duration-500"
    >
      {/* Background Slides */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-black/25 dark:bg-black/50 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfcfc] via-transparent to-black/40 dark:from-[#050505] dark:via-transparent dark:to-black/80 z-10 pointer-events-none" />
        
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              idx === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
            }`}
          >
            <img 
              ref={(el) => (imageRefs.current[idx] = el)}
              src={img} 
              alt={`Campaign shot ${idx + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center grayscale-[15%]"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </div>

      {/* Slide Navigation Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 sm:gap-4 pb-safe">
        {images.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentIndex(idx)}
            className="group py-2 sm:py-3 px-1 focus:outline-none cursor-pointer"
            aria-label={`Go to slide ${idx + 1}`}
          >
            <div 
              className={`h-[2px] transition-all duration-700 rounded-full ${
                idx === currentIndex 
                  ? 'w-10 sm:w-16 bg-zinc-900 dark:bg-white shadow-md' 
                  : 'w-5 sm:w-8 bg-zinc-400/50 dark:bg-white/30 group-hover:bg-zinc-800 dark:group-hover:bg-white/60'
              }`} 
            />
          </button>
        ))}
      </div>
    </section>
  );
}
