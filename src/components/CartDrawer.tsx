import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, CheckCircle2, ArrowLeft, Truck, Tag, Ticket, MessageCircle, ShieldCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { CartItem, User, Order, StoreSettings, Coupon } from '../types';
import { EGYPT_GOVERNORATES } from '../constants/governorates';
import { saveOrder, addAdminNotification } from '../lib/db';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  currentUser: User | null;
  storeSettings?: StoreSettings;
  onViewAdmin?: () => void;
  lang?: 'en' | 'ar';
}

export default function CartDrawer({ 
  isOpen, 
  onClose,
  cartItems,
  setCartItems,
  currentUser,
  storeSettings,
  onViewAdmin,
  lang = 'en'
}: CartDrawerProps) {
  const [isCheckout, setIsCheckout] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser, isOpen]);

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id && item.size === size) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string, size: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Helper to calculate eligible subtotal for a coupon
  const getEligibleSubtotal = (coupon: Coupon) => {
    if (coupon.applicableProductId) {
      return cartItems
        .filter(item => item.id === coupon.applicableProductId)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    if (coupon.applicableCategory) {
      return cartItems
        .filter(item => item.category === coupon.applicableCategory)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    return subtotal;
  };

  // Calculate coupon discount
  const eligibleSubtotal = appliedCoupon ? getEligibleSubtotal(appliedCoupon) : 0;
  const discountAmount = appliedCoupon ? (
    appliedCoupon.discountType === 'percentage' 
      ? Math.round((eligibleSubtotal * appliedCoupon.discountValue) / 100)
      : Math.min(eligibleSubtotal, appliedCoupon.discountValue)
  ) : 0;

  // Calculate dynamic shipping fee per selected governorate
  const shippingFee = (governorate && storeSettings?.shippingRates && storeSettings.shippingRates[governorate] !== undefined)
    ? storeSettings.shippingRates[governorate]
    : (EGYPT_GOVERNORATES.find(g => g.nameAr === governorate || g.nameEn === governorate)?.defaultPrice ?? storeSettings?.defaultShippingRate ?? 50);

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const code = couponInput.trim().toUpperCase();
    const found = (storeSettings?.coupons || []).find(c => c.code === code && c.active);

    if (!found) {
      setCouponError(lang === 'ar' ? 'كود الخصم غير صحيح أو غير مفعل.' : 'INVALID OR INACTIVE COUPON CODE.');
      return;
    }

    const eligibleAmount = getEligibleSubtotal(found);

    if (found.applicableProductId && eligibleAmount === 0) {
      setCouponError(lang === 'ar' 
        ? `عذراً، هذا الكوبون مخصص لمنتج "${found.applicableProductName || 'محدد'}" فقط وغير متوفر في السلة.`
        : `SORRY, THIS COUPON IS ONLY VALID FOR "${found.applicableProductName || 'SPECIFIC PRODUCT'}"`
      );
      return;
    }

    if (found.applicableCategory && eligibleAmount === 0) {
      setCouponError(lang === 'ar' 
        ? `عذراً، هذا الكوبون مخصص لمنتجات قسم "${found.applicableCategory}" فقط.`
        : `SORRY, THIS COUPON IS ONLY VALID FOR CATEGORY "${found.applicableCategory}"`
      );
      return;
    }

    if (found.minOrderAmount && subtotal < found.minOrderAmount) {
      setCouponError(lang === 'ar' 
        ? `الحد الأدنى لتطبيق الكوبون هو ${found.minOrderAmount} ج.م` 
        : `MIN ORDER FOR THIS COUPON IS ${found.minOrderAmount} EGP`
      );
      return;
    }

    setAppliedCoupon(found);
    setCouponSuccess(lang === 'ar' ? 'تم تطبيق خصم الكوبون بنجاح!' : 'COUPON APPLIED SUCCESSFULLY!');
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
  };

  const handlePlaceOrder = async (e: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setError('');
    
    if (isSubmitting) return;

    if (!name || !phone || !email || !governorate || !address) {
      setError(lang === 'ar' ? 'يرجى إدخال جميع بيانات الشحن والمحافظة المطلوبة.' : 'ALL SHIPPING DETAILS & GOVERNORATE ARE REQUIRED.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrder: Order = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        userId: currentUser?.id || null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        governorate,
        shippingFee,
        appliedCoupon: appliedCoupon?.code || null,
        discountAmount,
        address,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          image: item.image
        })),
        totalAmount,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };

      // Save order to Firestore & localStorage
      await saveOrder(newOrder);

      // Send Telegram Notification
      if (storeSettings?.telegramBotToken && storeSettings?.telegramChatId) {
        const productList = cartItems.map(i => `• ${i.name} (${i.size}) x${i.quantity} - ${i.price} EGP`).join('\n');
        const text = `<b>🆕 طلب جديد (New Order)</b>
━━━━━━━━━━━━━━━━━
<b>📦 رقم الطلب:</b> <code>${newOrder.id}</code>
<b>👤 العميل:</b> ${name}
<b>📱 الهاتف:</b> ${phone}
<b>📍 المحافظة:</b> ${governorate}
<b>🏠 العنوان:</b> ${address}
━━━━━━━━━━━━━━━━━
<b>🛒 المنتجات:</b>
${productList}

<b>💰 الإجمالي:</b> <b>${totalAmount.toLocaleString()} EGP</b>`;
        
        fetch(`https://api.telegram.org/bot${storeSettings.telegramBotToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: storeSettings.telegramChatId,
            text,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ تأكيد الطلب", callback_data: `confirm_${newOrder.id}` },
                  { text: "❌ إلغاء الطلب", callback_data: `cancel_${newOrder.id}` }
                ],
                [
                  { text: "🖨️ طباعة الفاتورة", url: `${window.location.origin.replace("ais-dev-", "ais-pre-")}/?print_order=${newOrder.id}` }
                ]
              ]
            }
          })
        }).catch(err => console.error("Telegram error:", err));
      }

      // Trigger admin notification
      await addAdminNotification({
        type: 'NEW_ORDER',
        title: `New Order Received (${newOrder.id})`,
        body: `${name} placed an order for ${totalAmount} EGP.`,
        relatedId: newOrder.id
      });

      const existingOrdersStr = localStorage.getItem('unknown_orders') || '[]';
      const orders: Order[] = JSON.parse(existingOrdersStr);
      orders.unshift(newOrder);
      localStorage.setItem('unknown_orders', JSON.stringify(orders));

      // Clear cart & show success screen
      setPlacedOrder(newOrder);
      setCartItems([]);
    } catch (err) {
      console.error("Failed to place order:", err);
      setError(lang === 'ar' ? 'حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.' : 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckout(false);
    setPlacedOrder(null);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[480px] bg-white text-zinc-900 border-l border-black/10 dark:bg-[#050505] dark:text-[#f5f5f7] dark:border-white/5 z-[200] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 md:p-8 flex justify-between items-center border-b border-black/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                {isCheckout && !placedOrder && (
                  <button 
                    onClick={() => setIsCheckout(false)}
                    className="text-zinc-500 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <h2 className="text-xl serif-display tracking-widest text-zinc-900 dark:text-[#f5f5f7]">
                  {placedOrder ? 'ORDER CONFIRMED' : isCheckout ? 'CHECKOUT' : 'SHOPPING BAG'}
                </h2>
              </div>
              <button 
                onClick={handleClose}
                className="text-zinc-500 hover:text-black dark:text-[#86868b] dark:hover:text-white transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {currentUser?.role === 'admin' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-2 space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shadow-lg">
                    <ShieldCheck size={36} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-zinc-900 dark:text-white tracking-wider">
                      {lang === 'ar' ? 'تقييد حساب مسؤول المتجر' : 'ADMIN ACCOUNT RESTRICTION'}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                      {lang === 'ar' 
                        ? 'حساب المسؤول مخصص لإدارة المنتجات، الطلبات، والعملاء، ولا يُسمح له بفتح صفحة الدفع أو إتمام طلبات الشراء.' 
                        : 'Admin accounts are strictly for store administration and cannot open checkout or place orders.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleClose();
                      if (onViewAdmin) onViewAdmin();
                    }}
                    className="px-6 py-3.5 bg-amber-500 text-zinc-950 font-black text-xs tracking-wider rounded-xl shadow-xl hover:bg-amber-400 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <ShieldCheck size={16} />
                    <span>{lang === 'ar' ? 'الانتقال إلى لوحة التحكم' : 'OPEN ADMIN DASHBOARD'}</span>
                  </button>
                </div>
              ) : placedOrder ? (
                /* Order Confirmation View */
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="serif-display text-3xl mb-2 text-zinc-900 dark:text-white font-light">THANK YOU FOR YOUR ORDER</h3>
                  <p className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 mb-6 font-medium">ORDER ID: #{placedOrder.id}</p>
                  
                  <div className="w-full bg-zinc-50 dark:bg-[#0A0A0A] p-6 border border-black/5 dark:border-white/5 text-left mb-8 text-[11px] luxury-tracking space-y-3">
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                      <span className="text-zinc-500 dark:text-white/50">{lang === 'ar' ? 'الاسم' : 'NAME'}</span>
                      <span className="text-zinc-900 dark:text-white font-medium">{placedOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                      <span className="text-zinc-500 dark:text-white/50">{lang === 'ar' ? 'الهاتف' : 'PHONE'}</span>
                      <span className="text-zinc-900 dark:text-white font-medium">{placedOrder.customerPhone}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                      <span className="text-zinc-500 dark:text-white/50">{lang === 'ar' ? 'المحافظة' : 'GOVERNORATE'}</span>
                      <span className="text-zinc-900 dark:text-white font-bold">{placedOrder.governorate || 'القاهرة'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                      <span className="text-zinc-500 dark:text-white/50">{lang === 'ar' ? 'العنوان' : 'ADDRESS'}</span>
                      <span className="text-zinc-900 dark:text-white font-medium truncate max-w-[200px]">{placedOrder.address}</span>
                    </div>
                    <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2">
                      <span className="text-zinc-500 dark:text-white/50">{lang === 'ar' ? 'سعر الشحن' : 'SHIPPING FEE'}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{(placedOrder.shippingFee || 0).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                    {placedOrder.appliedCoupon && (
                      <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>{lang === 'ar' ? `الخصم (${placedOrder.appliedCoupon})` : `DISCOUNT (${placedOrder.appliedCoupon})`}</span>
                        <span>-{(placedOrder.discountAmount || 0).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 font-bold text-sm">
                      <span className="text-zinc-500 dark:text-white/50">{lang === 'ar' ? 'الإجمالي الكلي' : 'TOTAL AMOUNT'}</span>
                      <span className="text-zinc-900 dark:text-white">{placedOrder.totalAmount.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>

                  {/* Direct WhatsApp Confirmation Button */}
                  <a 
                    href={`https://wa.me/2001022293420?text=${encodeURIComponent(
                      `مرحباً FOX TECH 👋\nقمت بطلب جديد من AVENTO7! 🛍️\n\n` +
                      `📋 *رقم الطلب:* #${placedOrder.id}\n` +
                      `👤 *الاسم:* ${placedOrder.customerName}\n` +
                      `📱 *الهاتف:* ${placedOrder.customerPhone}\n` +
                      `📍 *المحافظة:* ${placedOrder.governorate}\n` +
                      `🏠 *العنوان:* ${placedOrder.address}\n` +
                      (placedOrder.appliedCoupon ? `🎟️ *كوبون الخصم:* ${placedOrder.appliedCoupon}\n` : '') +
                      `💰 *الإجمالي النهائي:* ${placedOrder.totalAmount.toLocaleString()} ج.م\n\n` +
                      `أرجو تأكيد وطلب الشحن والتسليم. شكراً!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 text-white py-4 text-[10px] luxury-tracking font-bold tracking-[0.2em] hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 mb-3 shadow-lg cursor-pointer"
                  >
                    <MessageCircle size={16} />
                    {lang === 'ar' ? 'إرسال تفاصيل الطلب عبر الواتساب' : 'SEND ORDER VIA WHATSAPP'}
                  </a>

                  <button 
                    onClick={handleClose}
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-4 text-[10px] luxury-tracking font-bold tracking-[0.2em] hover:bg-zinc-800 dark:hover:bg-white/90 transition-colors"
                  >
                    {lang === 'ar' ? 'متابعة التسوق' : 'CONTINUE SHOPPING'}
                  </button>
                </div>
              ) : isCheckout ? (
                /* Checkout Form View */
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="flex flex-col gap-5">
                  {error && (
                    <div className="text-red-500 text-[10px] luxury-tracking p-3 bg-red-500/10 border border-red-500/20 font-bold">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 font-medium">
                      {lang === 'ar' ? 'الاسم بالكامل *' : 'FULL NAME *'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'ar' ? 'الاسم بالكامل' : 'FULL NAME'}
                      className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-2 text-xs luxury-tracking text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white transition-colors font-medium"
                      
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 font-medium">
                      {lang === 'ar' ? 'رقم الهاتف *' : 'PHONE NUMBER *'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={lang === 'ar' ? 'رقم الهاتف' : 'PHONE NUMBER'}
                      className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-2 text-xs luxury-tracking text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white transition-colors font-medium"
                      
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 font-medium">
                      {lang === 'ar' ? 'البريد الإلكتروني *' : 'EMAIL ADDRESS *'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}
                      className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-2 text-xs luxury-tracking text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white transition-colors font-medium"
                      
                    />
                  </div>

                  {/* Governorate Dropdown Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[10px] luxury-tracking text-amber-600 dark:text-amber-400 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck size={13} />
                        {lang === 'ar' ? 'المحافظة (حساب سعر الشحن) *' : 'GOVERNORATE (SHIPPING CALCULATOR) *'}
                      </span>
                      <span className="text-zinc-900 dark:text-white font-mono">
                        {shippingFee === 0 ? (lang === 'ar' ? 'شحن مجاني' : 'FREE') : `${shippingFee} ${lang === 'ar' ? 'ج.م' : 'EGP'}`}
                      </span>
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-[#0A0A0A] border border-black/20 dark:border-white/20 p-2.5 text-xs font-bold luxury-tracking text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                      
                    >
                      {EGYPT_GOVERNORATES.map((gov, idx) => {
                        const rate = (storeSettings?.shippingRates && storeSettings.shippingRates[gov.nameAr] !== undefined)
                          ? storeSettings.shippingRates[gov.nameAr]
                          : gov.defaultPrice;
                        return (
                          <option key={`${gov.id}-${idx}`} value={gov.nameAr} className="bg-white dark:bg-black text-zinc-900 dark:text-white">
                            {lang === 'ar' ? `${gov.nameAr} — شحن ${rate} ج.م` : `${gov.nameEn} (${gov.nameAr}) — ${rate} EGP`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 font-medium">
                      {lang === 'ar' ? 'عنوان التسليم التفصيلي *' : 'DELIVERY ADDRESS *'}
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={lang === 'ar' ? 'اسم الشارع، رقم المبنى، المنطقة...' : 'STREET, BUILDING, DISTRICT...'}
                      rows={2}
                      className="w-full bg-transparent border border-black/20 dark:border-white/20 p-2.5 text-xs luxury-tracking text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white transition-colors font-medium"
                      
                    />
                  </div>

                  <div className="p-3 bg-zinc-50 dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5 text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 font-medium flex justify-between items-center">
                    <span>{lang === 'ar' ? 'طريقة الدفع' : 'PAYMENT METHOD'}</span>
                    <span className="text-zinc-900 dark:text-white font-bold">{lang === 'ar' ? 'الدفع عند الاستلام' : 'CASH ON DELIVERY'}</span>
                  </div>

                  {/* Coupon Promo Code Section */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                    <label className="uppercase text-[10px] luxury-tracking text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                      <Ticket size={13} />
                      {lang === 'ar' ? 'هل لديك كود خصم (كوبون)؟' : 'HAVE A DISCOUNT COUPON?'}
                    </label>

                    {appliedCoupon ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 font-mono font-bold text-amber-600 dark:text-amber-400">
                          <Tag size={14} />
                          <span>{appliedCoupon.code}</span>
                          <span className="text-[10px] text-zinc-500 dark:text-white/60">
                            (-{discountAmount} {lang === 'ar' ? 'ج.م' : 'EGP'})
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-xs text-rose-500 hover:text-rose-700 font-bold underline cursor-pointer"
                        >
                          {lang === 'ar' ? 'إزالة' : 'REMOVE'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="AVENTO10"
                          className="flex-1 bg-zinc-50 dark:bg-[#0A0A0A] border border-black/20 dark:border-white/20 p-2 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-bold text-[10px] luxury-tracking hover:bg-zinc-800 dark:hover:bg-white/80 transition-colors cursor-pointer"
                        >
                          {lang === 'ar' ? 'تطبيق' : 'APPLY'}
                        </button>
                      </div>
                    )}

                    {couponError && (
                      <span className="text-[10px] text-rose-500 font-bold">{couponError}</span>
                    )}
                    {couponSuccess && (
                      <span className="text-[10px] text-emerald-500 font-bold">{couponSuccess}</span>
                    )}
                  </div>
                </form>
              ) : cartItems.length === 0 ? (
                /* Empty Bag View */
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 dark:text-[#86868b]">
                  <p className="luxury-tracking text-sm mb-6">YOUR BAG IS EMPTY</p>
                  <button onClick={onClose} className="border-b border-zinc-500 hover:border-black hover:text-black dark:border-[#86868b] dark:hover:border-white dark:hover:text-white transition-all text-[10px] luxury-tracking pb-1">
                    RETURN TO SHOP
                  </button>
                </div>
              ) : (
                /* Bag Items View */
                <div className="space-y-8">
                  {cartItems.map((item, idx) => (
                    <motion.div 
                      key={`${item.id}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="flex gap-6 border-b border-black/10 dark:border-white/5 pb-8"
                    >
                      <div className="w-24 h-32 bg-zinc-100 dark:bg-[#0A0A0A] overflow-hidden border border-black/5 dark:border-white/5">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xs luxury-tracking font-medium text-zinc-900 dark:text-white">{lang === 'ar' ? (item.nameAr || item.name) : item.name}</h3>
                          <button 
                            onClick={() => removeItem(item.id, item.size)}
                            className="text-zinc-500 hover:text-black dark:text-[#86868b] dark:hover:text-white text-[10px] luxury-tracking border-b border-transparent hover:border-current transition-all"
                          >
                            {lang === 'ar' ? 'إزالة' : 'REMOVE'}
                          </button>
                        </div>
                        <p className="text-zinc-600 dark:text-[#86868b] text-[11px] luxury-tracking mb-4">{item.price.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</p>
                        
                        <div className="mt-auto flex justify-between items-end">
                          <div className="flex items-center gap-4 bg-zinc-100 dark:bg-[#0A0A0A] px-2 py-1 border border-black/10 dark:border-white/5">
                            <button 
                              onClick={() => updateQuantity(item.id, item.size, -1)}
                              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-black dark:text-[#86868b] dark:hover:text-white"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs w-4 text-center font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.size, 1)}
                              className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-black dark:text-[#86868b] dark:hover:text-white"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="text-[10px] luxury-tracking text-zinc-500 dark:text-[#86868b]">
                            {lang === 'ar' ? 'المقاس' : 'SIZE'}: {item.size}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!placedOrder && cartItems.length > 0 && (
              <div className="border-t border-black/10 dark:border-white/5 p-5 md:p-6 pb-safe bg-zinc-50 dark:bg-[#050505]">
                {isCheckout ? (
                  <div className="space-y-2 mb-6 text-[11px] luxury-tracking">
                    <div className="flex justify-between items-center text-zinc-500 dark:text-[#86868b]">
                      <span>{lang === 'ar' ? 'سعر المنتجات' : 'SUBTOTAL'}</span>
                      <span className="font-mono">{subtotal.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-semibold">
                      <span>{lang === 'ar' ? `الشحن (${governorate})` : `SHIPPING (${governorate})`}</span>
                      <span className="font-mono">{shippingFee === 0 ? (lang === 'ar' ? 'مجاني' : 'FREE') : `${shippingFee.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {lang === 'ar' ? `خصم الكوبون (${appliedCoupon.code})` : `DISCOUNT (${appliedCoupon.code})`}
                        </span>
                        <span className="font-mono">-{discountAmount.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-black/10 dark:border-white/10 text-zinc-900 dark:text-white font-bold text-xs">
                      <span>{lang === 'ar' ? 'الإجمالي النهائي' : 'TOTAL AMOUNT'}</span>
                      <span className="font-mono text-sm">{totalAmount.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mb-6 text-[11px] luxury-tracking">
                    <span className="text-zinc-500 dark:text-[#86868b]">{lang === 'ar' ? 'المجموع الفرعي' : 'SUBTOTAL'}</span>
                    <span className="text-zinc-900 dark:text-white font-bold">{subtotal.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                  </div>
                )}

                {isCheckout ? (
                  <button 
                    type="button"
                    onClick={(e) => handlePlaceOrder(e as any)}
                    disabled={isSubmitting}
                    className="w-full relative group bg-[#30001A] text-white dark:bg-white dark:text-[#30001A] py-4 px-6 overflow-hidden font-bold text-[10px] luxury-tracking tracking-[0.2em] hover:bg-[#1b000f] dark:hover:bg-[#f8f1f5] transition-colors shadow-lg shadow-[#30001A]/20 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (lang === 'ar' ? 'جاري الإرسال...' : 'PLACING ORDER...') : (lang === 'ar' ? 'تأكيد وإرسال الطلب الآن' : 'PLACE ORDER NOW')}
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsCheckout(true)}
                    className="w-full relative group bg-[#30001A] text-white dark:bg-white dark:text-[#30001A] py-4 px-6 overflow-hidden font-bold text-[10px] luxury-tracking tracking-[0.2em] hover:bg-[#1b000f] dark:hover:bg-[#f8f1f5] transition-colors shadow-lg shadow-[#30001A]/20 cursor-pointer"
                  >
                    {lang === 'ar' ? 'المتابعة لإتمام الطلب' : 'PROCEED TO CHECKOUT'}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
