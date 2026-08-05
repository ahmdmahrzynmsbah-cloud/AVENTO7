import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Minus, Plus, Bell, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, Maximize2, ArrowLeftRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Product, User } from '../types';
import { saveProduct, addNotificationRequest } from '../lib/db';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onUpdateProduct?: (product: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
  currentUserContact?: string;
  currentUserId?: string;
  currentUser?: User | null;
  onViewAdmin?: () => void;
  lang?: 'en' | 'ar';
}

export default function ProductModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onUpdateProduct,
  isCompared = false,
  onToggleCompare,
  currentUserContact = '',
  currentUserId = '',
  lang = 'en' 
}: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [subscriberContact, setSubscriberContact] = useState('');
  const [isSubscribedSuccess, setIsSubscribedSuccess] = useState(false);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);

  useEffect(() => {
    if (currentUserContact) {
      setSubscriberContact(currentUserContact);
    }
  }, [currentUserContact, product?.id]);

  useEffect(() => {
    setActiveImageIndex(0);
    setIsFullscreenZoom(false);
  }, [product?.id]);

  if (!isOpen || !product) return null;

  const galleryImages = (product.images && product.images.length > 0)
    ? product.images 
    : [product.image];

  const currentImage = galleryImages[activeImageIndex] || product.image;

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length) return;
    onAddToCart(product, selectedSize || 'ONE SIZE', quantity);
    onClose();
    // Reset state
    setTimeout(() => {
      setSelectedSize('');
      setQuantity(1);
    }, 300);
  };

  const handleSubscribeRestock = async () => {
    if (!subscriberContact.trim() || !product) return;
    setIsSubmittingSub(true);

    const contactVal = subscriberContact.trim();
    const isEmail = contactVal.includes('@');
    const uId = currentUserId || `usr_${contactVal.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Store user ID, contact info and product ID in 'notifications' collection in Firestore
    await addNotificationRequest({
      userId: uId,
      userEmail: isEmail ? contactVal : (currentUserContact?.includes('@') ? currentUserContact : ''),
      userPhone: !isEmail ? contactVal : '',
      productId: product.id,
      productName: product.nameAr || product.name,
    });

    const existingSubscribers = product.notifySubscribers || [];
    if (!existingSubscribers.includes(contactVal)) {
      const updatedProduct: Product = {
        ...product,
        notifySubscribers: [...existingSubscribers, contactVal]
      };
      await saveProduct(updatedProduct);
      onUpdateProduct?.(updatedProduct);
    }

    setIsSubmittingSub(false);
    setIsSubscribedSuccess(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-8"
      >
        <div className="absolute inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-white text-zinc-900 dark:bg-[#0a0a0a] dark:text-white border border-black/10 dark:border-white/10 flex flex-col md:flex-row overflow-hidden max-h-[92vh] md:max-h-[88vh] shadow-2xl rounded-2xl md:rounded-3xl"
        >
          {/* Close Modal Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors rounded-full border border-black/10 dark:border-white/10 shadow-lg cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Luxury Gallery Image Section */}
          <div className="w-full md:w-1/2 h-[45vh] md:h-auto min-h-[350px] md:min-h-[500px] relative bg-neutral-100 dark:bg-[#070707] flex flex-col justify-between overflow-hidden group">
            {/* Main Active Image Viewport */}
            <div className="relative w-full flex-1 overflow-hidden flex items-center justify-center bg-black/5 dark:bg-white/5">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImageIndex}
                  src={currentImage} 
                  alt={`${product.name} - View ${activeImageIndex + 1}`} 
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={`w-full h-full object-cover cursor-zoom-in ${product.isSoldOut ? 'grayscale-[25%] opacity-85' : ''}`}
                  referrerPolicy="no-referrer"
                  onClick={() => setIsFullscreenZoom(true)}
                />
              </AnimatePresence>

              {/* Status Badges */}
              {product.isSoldOut ? (
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 text-[10px] luxury-tracking px-3 py-1.5 border border-rose-500/50 bg-rose-950/90 text-rose-200 backdrop-blur-md uppercase font-bold tracking-widest shadow-2xl flex items-center gap-1.5 rounded-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  {lang === 'ar' ? 'نفذت الكمية (SOLD OUT)' : 'SOLD OUT'}
                </div>
              ) : product.originalPrice && product.originalPrice > product.price ? (
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 text-[10px] luxury-tracking px-3 py-1.5 border border-rose-500/30 bg-rose-600/90 text-white backdrop-blur-md uppercase font-bold shadow-md rounded-md">
                  {lang === 'ar' ? 'خصم' : 'SALE'} {Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              ) : product.isNew ? (
                <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-10 text-[10px] luxury-tracking px-3 py-1.5 border border-black/10 dark:border-white/20 bg-black/70 text-white backdrop-blur-md uppercase font-semibold rounded-md">
                  {lang === 'ar' ? 'جديد' : 'NEW'}
                </div>
              ) : null}

              {/* Image Index Counter Badge */}
              {galleryImages.length > 1 && (
                <div className="absolute top-4 right-16 z-10 text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 bg-black/60 text-white backdrop-blur-md rounded-full border border-white/10">
                  {activeImageIndex + 1} / {galleryImages.length}
                </div>
              )}

              {/* Zoom trigger icon */}
              <button
                onClick={() => setIsFullscreenZoom(true)}
                className="absolute bottom-4 right-4 z-10 p-2.5 bg-black/50 text-white hover:bg-black/80 backdrop-blur-md rounded-full transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20"
                title={lang === 'ar' ? 'تكبير الصورة' : 'Zoom Image'}
              >
                <Maximize2 size={14} />
              </button>

              {/* Gallery Arrow Controls */}
              {galleryImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/40 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center rounded-full transition-all border border-white/20 cursor-pointer opacity-80 hover:opacity-100 hover:scale-110"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/40 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center rounded-full transition-all border border-white/20 cursor-pointer opacity-80 hover:opacity-100 hover:scale-110"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Thumbnail Strip at Bottom */}
            {galleryImages.length > 1 && (
              <div className="p-3 bg-black/20 dark:bg-black/60 backdrop-blur-md border-t border-black/10 dark:border-white/10 flex items-center gap-2.5 overflow-x-auto scrollbar-none shrink-0 justify-center">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${
                      activeImageIndex === idx 
                        ? 'border-amber-500 scale-105 shadow-md' 
                        : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-[#86868b] font-bold">{product.category}</span>
                <span className="w-1 h-1 bg-black/20 dark:bg-white/20 rounded-full"></span>
                <span className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-[#86868b] font-bold">
                  {lang === 'ar' ? (product.gender === 'Men' ? 'رجالي' : product.gender === 'Women' ? 'نسائي' : 'للجنسين') : product.gender}
                </span>
              </div>
              <h2 className="serif-display text-2xl sm:text-3xl md:text-4xl text-zinc-900 dark:text-white mb-3 font-medium tracking-tight">
                {lang === 'ar' ? (product.nameAr || product.name) : product.name}
              </h2>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-end gap-2">
                  <span className="text-xl font-extrabold font-mono text-zinc-900 dark:text-white">{product.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm font-medium line-through text-zinc-400 mb-[2px]">
                      {product.originalPrice.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  )}
                </div>
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <span className="w-[1px] h-4 bg-black/20 dark:bg-white/20"></span>
                    <div className="flex items-center text-[#d4af37]">
                      <Star size={14} fill="currentColor" />
                      <span className="ml-1 rtl:mr-1 rtl:ml-0 text-sm font-bold">{product.rating}</span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-[#86868b]">({product.reviews} {lang === 'ar' ? 'تقييم' : 'REVIEWS'})</span>
                  </div>
                )}
              </div>

              {/* Sold Out Banner */}
              {product.isSoldOut && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 p-3.5 rounded-xl mb-5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                    <span className="text-xs font-extrabold uppercase luxury-tracking">
                      {lang === 'ar' ? 'نفذت الكمية حالياً (Sold Out)' : 'CURRENTLY OUT OF STOCK'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                    {lang === 'ar' ? 'سجل ليصلك إشعار' : 'Restock alert'}
                  </span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#86868b] leading-relaxed">
                {lang === 'ar' ? (product.descriptionAr || product.description) : (product.description || 'Premium quality garment crafted with precision and care.')}
              </p>
            </div>

            {/* Sizing */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] luxury-tracking uppercase text-zinc-800 dark:text-white/80 font-bold">{lang === 'ar' ? 'اختر المقاس' : 'Select Size'}</span>
                  <button className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-[#86868b] underline hover:text-amber-500">{lang === 'ar' ? 'دليل المقاسات' : 'Size Guide'}</button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 flex items-center justify-center border rounded-lg text-xs transition-colors cursor-pointer ${
                        selectedSize === size 
                          ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-extrabold shadow-md' 
                          : 'border-black/20 text-zinc-800 hover:border-black dark:border-white/20 dark:text-white dark:hover:border-white/60'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions: Sold Out Subscription or Quantity & Add to Cart */}
            {product.isSoldOut ? (
              <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/10">
                {isSubscribedSuccess ? (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-center space-y-2 animate-fadeIn">
                    <CheckCircle size={24} className="mx-auto text-emerald-500" />
                    <h4 className="text-xs font-bold uppercase luxury-tracking">
                      {lang === 'ar' ? 'تم تسجيل طلب الإشعار بنجاح! ✨' : 'RESTOCK ALERT SET SUCCESSFULLY! ✨'}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      {lang === 'ar' 
                        ? `سنرسل لك إشعاراً تلقائياً فور توفر هذا المنتج مجدداً على: ${subscriberContact}`
                        : `We will automatically notify you as soon as this item is back in stock at: ${subscriberContact}`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase luxury-tracking text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Bell size={13} className="animate-bounce" />
                        {lang === 'ar' ? 'إشعار توفر المنتج التلقائي' : 'AUTOMATIC RESTOCK NOTIFICATION'}
                      </label>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' 
                          ? 'أدخل بريدك الإلكتروني أو رقم الواتساب ليصلك تنبيه مباشر فور وصول شحنة جديدة.'
                          : 'Enter your email or WhatsApp number to get notified instantly when restocked.'
                        }
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-1">
                      <input
                        type="text"
                        value={subscriberContact}
                        onChange={(e) => setSubscriberContact(e.target.value)}
                        placeholder={lang === 'ar' ? 'بريدك أو رقم الهاتف (مثال: 010...)' : 'Email or Phone number...'}
                        className="flex-1 bg-zinc-50 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-lg px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <button
                        onClick={handleSubscribeRestock}
                        disabled={!subscriberContact.trim() || isSubmittingSub}
                        className="px-5 py-2.5 bg-amber-500 text-black font-extrabold uppercase text-xs luxury-tracking hover:bg-amber-400 disabled:opacity-50 transition-all rounded-lg cursor-pointer shrink-0 shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Bell size={13} />
                        <span>{lang === 'ar' ? 'أبلغني عند التوفر' : 'NOTIFY ME'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-auto pt-6 border-t border-black/10 dark:border-white/10 flex flex-col gap-4">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] luxury-tracking uppercase text-zinc-800 dark:text-white/80 font-bold">{lang === 'ar' ? 'الكمية' : 'Quantity'}</span>
                  <div className="flex items-center gap-3 border border-black/20 dark:border-white/20 px-3.5 py-1.5 rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-zinc-500 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-bold text-xs">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-zinc-500 hover:text-black dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize && !!product.sizes?.length}
                    className={`flex-1 py-4 rounded-xl flex justify-center items-center gap-2 transition-all duration-300 ${
                      !selectedSize && !!product.sizes?.length
                        ? 'bg-zinc-200 text-zinc-400 dark:bg-white/10 dark:text-white/40 cursor-not-allowed'
                        : 'bg-[#30001A] text-white hover:bg-[#1b000f] dark:bg-white dark:text-[#30001A] dark:hover:bg-[#f8f1f5] shadow-lg shadow-[#30001A]/20 cursor-pointer font-bold'
                    }`}
                  >
                    <span className="text-[11px] luxury-tracking uppercase">
                      {!selectedSize && !!product.sizes?.length ? (lang === 'ar' ? 'اختر مقاساً أولاً' : 'SELECT A SIZE') : (lang === 'ar' ? 'أضف لحقيبة التسوق' : 'ADD TO SECURE BAG')}
                    </span>
                    {selectedSize || !product.sizes?.length ? <span className="font-mono">— {(product.price * quantity).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span> : null}
                  </button>

                  {onToggleCompare && (
                    <button
                      type="button"
                      onClick={() => onToggleCompare(product)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 min-w-[52px] min-h-[52px] ${
                        isCompared
                          ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold shadow-md'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-black/10 dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15'
                      }`}
                      title={lang === 'ar' ? 'إضافة للمقارنة' : 'Compare product'}
                      aria-label="Compare"
                    >
                      <ArrowLeftRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Fullscreen Lightbox Zoom Modal */}
      {isFullscreenZoom && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
          onClick={() => setIsFullscreenZoom(false)}
        >
          <button 
            onClick={() => setIsFullscreenZoom(false)}
            className="absolute top-6 right-6 z-30 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
          
          <img 
            src={currentImage} 
            alt="Fullscreen zoom" 
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />

          {galleryImages.length > 1 && (
            <div className="mt-4 flex items-center gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-amber-400 scale-110' : 'border-white/20 opacity-50'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

