import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ShieldCheck, FileText, Award, CheckCircle } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'about' | 'privacy' | 'terms';
  lang?: 'en' | 'ar';
}

export default function InfoModal({ isOpen, onClose, type, lang = 'ar' }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-wine/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-wine/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 text-wine dark:text-white my-auto max-h-[85vh] flex flex-col"
        >
          {/* Top Bar / Header */}
          <div className="p-6 border-b border-wine/10 dark:border-white/10 flex items-center justify-between bg-zinc-50 dark:bg-[#121212] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center">
                {type === 'about' && <Sparkles size={20} />}
                {type === 'privacy' && <ShieldCheck size={20} />}
                {type === 'terms' && <FileText size={20} />}
              </div>
              <div>
                <h3 className="serif-display text-xl font-bold tracking-wide">
                  {type === 'about' && (lang === 'ar' ? 'عن ماركة KEMET' : 'ABOUT KEMET STUDIOS')}
                  {type === 'privacy' && (lang === 'ar' ? 'سياسة الخصوصية' : 'PRIVACY POLICY')}
                  {type === 'terms' && (lang === 'ar' ? 'الشروط والأحكام وحقوق الملكية' : 'TERMS & COPYRIGHT')}
                </h3>
                <p className="text-[10px] luxury-tracking text-zinc-500 dark:text-zinc-400 uppercase">
                  {type === 'about' && 'HERITAGE & CRAFTSMANSHIP'}
                  {type === 'privacy' && 'DATA PROTECTION & SECURITY'}
                  {type === 'terms' && 'LEGAL AGREEMENT & RIGHTS'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-wine/5 dark:bg-white/10 hover:bg-wine/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-zinc-600 dark:text-zinc-300"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Scrollable Content */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 rtl:text-right">
            {type === 'about' && (
              <>
                {/* Hero brand banner */}
                <div className="relative rounded-xl p-8 bg-gradient-to-br from-zinc-900 to-black text-white overflow-hidden shadow-inner border border-white/10">
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>
                  <h4 className="serif-display text-3xl font-light tracking-widest text-amber-400 mb-2">
                    KEMET STUDIOS
                  </h4>
                  <p className="text-xs luxury-tracking text-zinc-400 uppercase leading-relaxed">
                    {lang === 'ar' ? 'خطوط معمارية وملابس فاخرة مصممة لرواد العصر الحديث' : 'ARCHITECTURAL SILHOUETTES & REFINED DARK-WEAR TAILORED FOR THE MODERN AVANT-GARDE'}
                  </p>
                </div>

                <div className="space-y-4">
                  <h5 className="font-bold text-wine dark:text-white text-base flex items-center gap-2 border-b border-wine/10 dark:border-white/10 pb-2">
                    <Award size={18} className="text-amber-500 shrink-0" />
                    <span>{lang === 'ar' ? 'رؤيتنا وفلسفة التصميم' : 'Our Vision & Philosophy'}</span>
                  </h5>
                  <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {lang === 'ar'
                      ? 'تأسست ماركة KEMET لتعيد تعريف مفهوم الأزياء العصرية الراقية. نحن نؤمن بأن الملابس ليست مجرد مظهر، بل هي لغة تعبر عن الهوية والثقة والاستقلالية. تجمع تصميماتنا بين الهندسية المعمارية الدقيقة واللمسات الفنية الجريئة.'
                      : 'KEMET was founded to redefine modern luxury streetwear. We believe garments are not just apparel, but a silent language expressing confidence and individuality. Our designs blend architectural structure with bold avant-garde aesthetics.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#141414] border border-wine/5 dark:border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase">
                      <CheckCircle size={16} />
                      <span>{lang === 'ar' ? 'أجود أنواع الخامات' : 'PREMIUM MATERIALS'}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {lang === 'ar'
                        ? 'نخبة القطن المصري والمنسوجات الفاخرة المقاومة للانكماش لتضمن الراحة والأناقة الدائمة.'
                        : 'Sourced from the finest Egyptian long-staple cotton and premium durable textiles.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#141414] border border-wine/5 dark:border-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase">
                      <CheckCircle size={16} />
                      <span>{lang === 'ar' ? 'دقة الخياطة والحرفية' : 'MASTER CRAFTSMANSHIP'}</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      {lang === 'ar'
                        ? 'تفاصيل محبوكة بدقة متناهية وفحوصات جودة صارمة لكل قطعة قبل وصولها للعميل.'
                        : 'Meticulous attention to detail and rigorous quality inspection before dispatch.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider">
                    {lang === 'ar' ? 'تصميم مصري بمواصفات عالمية' : 'DESIGNED IN EGYPT, WORLD-CLASS QUALITY'}
                  </span>
                  <span className="serif-display font-serif font-bold text-base">KEMET</span>
                </div>
              </>
            )}

            {type === 'privacy' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck size={18} />
                  <span>{lang === 'ar' ? 'خصوصيتك وبياناتك الشخصية أمانة نلتزم بها تماماً' : 'YOUR PRIVACY IS FULLY PROTECTED WITH US'}</span>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-wine dark:text-white text-xs uppercase tracking-wider">
                    1. {lang === 'ar' ? 'جمع المعلومات' : 'Information Collection'}
                  </h5>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ar'
                      ? 'نقوم بجمع البيانات الأساسية فقط المطلوبة لتوصيل الطلبات إليك، مثل الاسم ورقم الهاتف وعنوان التوصيل والبريد الإلكتروني.'
                      : 'We only collect essential data required to fulfill and deliver your orders, including name, phone number, shipping address, and email.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-wine dark:text-white text-xs uppercase tracking-wider">
                    2. {lang === 'ar' ? 'حماية البيانات وعدم المشاركة' : 'Data Protection & No Third-Party Sharing'}
                  </h5>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ar'
                      ? 'لا نقوم ببيع أو تأجير أو مشاركة أي من بياناتك مع أطراف ثالثة لأغراض إعلانية. بياناتك تستخدم حصرياً لمعالجة طلباتك وتسهيل التواصل معك.'
                      : 'We never sell, rent, or share your personal data with third parties for marketing. Your information is strictly used for order processing and direct support.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-wine dark:text-white text-xs uppercase tracking-wider">
                    3. {lang === 'ar' ? 'الأمان والتشفير' : 'Security & Encryption'}
                  </h5>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ar'
                      ? 'جميع العمليات وتفاصيل المعاملات محمية بأنظمة تشفير عالية الأمان لضمان سلامة بياناتك في كل وقت.'
                      : 'All transactions and user sessions are encrypted with standard security protocols to ensure maximum safety.'}
                  </p>
                </div>
              </div>
            )}

            {type === 'terms' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center gap-2">
                  <FileText size={18} />
                  <span>{lang === 'ar' ? 'حقوق الملكية الفكرية وتراخيص الاستخدام' : 'INTELLECTUAL PROPERTY & TERMS OF USE'}</span>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-wine dark:text-white text-xs uppercase tracking-wider">
                    1. {lang === 'ar' ? 'حقوق الملكية العلامة التجارية' : 'Brand Trademark & Copyright'}
                  </h5>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ar'
                      ? 'جميع التصاميم، والشعارات، والرموز، والصور الموجودة في هذا المتجر هي ملكية حصرية لـ KEMET STUDIOS ومحمية بموجب قوانين حقوق النشر والملكية الفكرية. يمنع منعا باتا نسخها أو إعادة استخدامها بدون إذن كتابي مسبق.'
                      : 'All designs, logos, images, and brand materials belong exclusively to KEMET STUDIOS and are protected under international copyright and trademark laws. Reproduction without written consent is strictly prohibited.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-wine dark:text-white text-xs uppercase tracking-wider">
                    2. {lang === 'ar' ? 'سياسة الاسترجاع والشحن' : 'Shipping & Returns Terms'}
                  </h5>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ar'
                      ? 'يحق للعميل معاينة المنتج واستبداله أو إرجاعه خلال المدة المحددة بشرط أن يكون بحالته الأصلية غير مستخدم ومرفق بكافة الملصقات والغلاف الأصلي.'
                      : 'Customers can exchange or return products within the eligible return period provided items are unworn, in original packaging with all tags attached.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-wine dark:text-white text-xs uppercase tracking-wider">
                    3. {lang === 'ar' ? 'تطوير وتشغيل المتجر' : 'Store Development & Operations'}
                  </h5>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {lang === 'ar'
                      ? 'تم تطوير البنية البرمجية والتصميم الإلكتروني لمتجر KEMET بواسطة FOX TECH.'
                      : 'The digital infrastructure and user interface for KEMET store was custom built & engineered by FOX TECH.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-zinc-50 dark:bg-[#121212] border-t border-wine/10 dark:border-white/10 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="bg-wine dark:bg-white text-white dark:text-wine px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : 'CLOSE'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
