import { useState } from 'react';
import { ArrowRight, Facebook, Instagram } from 'lucide-react';
import { SocialLinks } from '../types';
import InfoModal from './InfoModals';

interface FooterProps {
  onOpenTrackOrder?: () => void;
  socialLinks?: SocialLinks;
  lang?: 'en' | 'ar';
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65 6.34 6.34 0 0 0 9.35 22a6.3 6.3 0 0 0 6.27-6.23V9.16a9 9 0 0 0 5.08 1.56V7.27a6.29 6.29 0 0 1-1.11-.58z"/>
    </svg>
  );
}

export default function Footer({ onOpenTrackOrder, socialLinks, lang = 'en' }: FooterProps) {
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | null>(null);

  const fbUrl = socialLinks?.facebook || 'https://facebook.com';
  const instaUrl = socialLinks?.instagram || 'https://instagram.com';
  const tiktokUrl = socialLinks?.tiktok || 'https://tiktok.com';

  return (
    <footer className="w-full bg-[#f4f4f2] text-zinc-900 border-t border-black/10 dark:bg-[#050505] dark:text-[#f5f5f7] dark:border-white/5 pt-16 md:pt-24 pb-8 md:pb-12 px-6 md:px-12 relative overflow-hidden flex flex-col items-center transition-colors duration-500">
      {/* Subtle background line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent"></div>
      
      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-20 relative z-10 mb-16">
        
        <div className="w-full lg:w-1/3 flex flex-col">
          <h3 className="serif-display text-3xl md:text-5xl mb-6 font-light tracking-wide text-zinc-900 dark:text-[#f5f5f7] rtl:font-sans rtl:font-bold">
            {lang === 'ar' ? (
              <>انضم إلى <i className="italic text-black dark:text-white font-normal">أفينتو 7</i></>
            ) : (
              <>JOIN THE <i className="italic text-black dark:text-white font-normal">AVENTO7</i></>
            )}
          </h3>
          <p className="text-[10px] luxury-tracking text-zinc-600 dark:text-[#86868b] leading-relaxed mb-10 max-w-[280px]">
            {lang === 'ar' ? 'اشترك للحصول على تحديثات التشكيلات الجديدة والوصول الحصري.' : 'SUBSCRIBE TO RECEIVE UPDATES ON NEW RELEASES, EDITORIALS, AND EXCLUSIVE ACCESS.'}
          </p>
          <form className="relative w-full max-w-sm group" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder={lang === 'ar' ? 'عنوان البريد الإلكتروني' : 'YOUR EMAIL ADDRESS'} 
              className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-4 pr-10 pl-0 rtl:pr-0 rtl:pl-10 text-[10px] luxury-tracking text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white transition-colors uppercase text-left rtl:text-right"
            />
            <button 
              type="submit" 
              className="absolute right-0 rtl:right-auto rtl:left-0 bottom-4 text-zinc-900 dark:text-white opacity-60 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-pointer p-1"
            >
              <ArrowRight size={16} strokeWidth={1.5} className="rtl:rotate-180" />
            </button>
          </form>
        </div>

        <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-8 text-[10px] luxury-tracking text-zinc-600 dark:text-[#86868b]">
          <div className="flex flex-col gap-5">
            <h4 className="text-zinc-900 dark:text-white font-medium tracking-[0.2em] mb-2 uppercase">
              {lang === 'ar' ? 'عن المتجر' : 'AVENTO7'}
            </h4>
            
            <button 
              onClick={() => setActiveModal('about')}
              className="hover:text-black dark:hover:text-white transition-colors w-fit group flex items-center gap-2 cursor-pointer text-left rtl:text-right"
            >
              <span className="w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-3"></span>
              {lang === 'ar' ? 'عن الماركة' : 'ABOUT THE BRAND'}
            </button>

            <button 
              onClick={() => setActiveModal('privacy')}
              className="hover:text-black dark:hover:text-white transition-colors w-fit group flex items-center gap-2 cursor-pointer text-left rtl:text-right"
            >
              <span className="w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-3"></span>
              {lang === 'ar' ? 'سياسة الخصوصية' : 'PRIVACY POLICY'}
            </button>

            <button 
              onClick={() => setActiveModal('terms')}
              className="hover:text-black dark:hover:text-white transition-colors w-fit group flex items-center gap-2 cursor-pointer text-left rtl:text-right"
            >
              <span className="w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-3"></span>
              {lang === 'ar' ? 'الشروط وحقوق الملكية' : 'TERMS & COPYRIGHT'}
            </button>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-zinc-900 dark:text-white font-medium tracking-[0.2em] mb-2 uppercase">
              {lang === 'ar' ? 'الدعم والمساعدة' : 'SUPPORT'}
            </h4>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors w-fit group flex items-center gap-2">
              <span className="w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-3"></span>
              {lang === 'ar' ? 'الشحن والاسترجاع' : 'SHIPPING & RETURNS'}
            </a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors w-fit group flex items-center gap-2">
              <span className="w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-3"></span>
              {lang === 'ar' ? 'دليل المقاسات' : 'SIZE GUIDE'}
            </a>
            <button 
              onClick={(e) => {
                e.preventDefault();
                if (onOpenTrackOrder) onOpenTrackOrder();
              }}
              className="hover:text-black dark:hover:text-white transition-colors w-fit group flex items-center gap-2 cursor-pointer text-left rtl:text-right"
            >
              <span className="w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-3"></span>
              {lang === 'ar' ? 'تتبع طلبك' : 'TRACK ORDER'}
            </button>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors w-fit group flex items-center gap-2">
              <span className="w-0 h-[1px] bg-black dark:bg-white transition-all duration-300 group-hover:w-3"></span>
              {lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
            </a>
          </div>

          {/* Social & Contact Us Block */}
          <div className="flex flex-col gap-5 col-span-2 md:col-span-1 border-t md:border-t-0 border-black/10 dark:border-white/10 pt-8 md:pt-0">
            <h4 className="text-zinc-900 dark:text-white font-medium tracking-[0.2em] mb-2 uppercase flex items-center gap-2">
              {lang === 'ar' ? 'تواصل معنا' : 'CONNECT WITH US'}
            </h4>

            {/* Social Media Links with Icons */}
            <div className="flex flex-col gap-3">
              {fbUrl && (
                <a 
                  href={fbUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors w-fit flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200"
                >
                  <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <Facebook size={14} />
                  </div>
                  <span className="font-bold tracking-wider">{lang === 'ar' ? 'فيسبوك' : 'FACEBOOK'}</span>
                </a>
              )}

              {instaUrl && (
                <a 
                  href={instaUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors w-fit flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200"
                >
                  <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <Instagram size={14} />
                  </div>
                  <span className="font-bold tracking-wider">{lang === 'ar' ? 'انستغرام' : 'INSTAGRAM'}</span>
                </a>
              )}

              {tiktokUrl && (
                <a 
                  href={tiktokUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors w-fit flex items-center gap-2.5 text-zinc-800 dark:text-zinc-200"
                >
                  <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                    <TikTokIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold tracking-wider">{lang === 'ar' ? 'تيك توك' : 'TIKTOK'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Massive Brand Name Footer */}
      <div className="w-full max-w-[1400px] mx-auto flex justify-center opacity-10 select-none pointer-events-none mb-6 md:mb-8 px-2 overflow-hidden">
        <h2 className="brand-logo text-[12vw] xs:text-[14vw] lg:text-[180px] font-bold tracking-[0.02em] sm:tracking-[0.1em] text-center leading-none text-zinc-900 dark:text-white whitespace-nowrap max-w-full">
          AVENTO7
        </h2>
      </div>

      <div className="w-full max-w-[1400px] pt-8 border-t border-black/10 dark:border-white/10 flex justify-center items-center text-[9px] luxury-tracking text-zinc-500 dark:text-[#666666] relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
          <p>&copy; {(new Date()).getFullYear()} AVENTO7 STUDIOS. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'ALL RIGHTS RESERVED.'}</p>
          <span className="hidden md:block w-3 h-[1px] bg-black/20 dark:bg-white/20"></span>
          <p className="flex items-center gap-2">
            {lang === 'ar' ? 'تطوير' : 'DEVELOPED BY'}{" "}
            <a 
              href="https://wa.me/201022293420" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-zinc-900 dark:text-white font-bold tracking-[0.2em] hover:text-amber-500 dark:hover:text-amber-400 transition-colors underline decoration-amber-500/40 underline-offset-4"
            >
              FOX TECH
            </a>
          </p>
        </div>
      </div>
      
      <InfoModal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        type={activeModal || 'about'} 
        lang={lang} 
      />
    </footer>
  );
}
