import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Package, Clock, CheckCircle2, Truck, AlertTriangle, Phone, MapPin, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Order } from '../types';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  lang?: 'en' | 'ar';
}

export default function OrderTrackerModal({
  isOpen,
  onClose,
  orders,
  lang = 'en'
}: OrderTrackerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === query ||
        o.customerPhone.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
    );

    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const getStatusStep = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 1;
      case 'PROCESSING':
        return 2;
      case 'COMPLETED':
        return 4;
      case 'CANCELLED':
        return 0;
      default:
        return 1;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-wine/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white text-wine dark:bg-[#0A0A0A] dark:text-white border border-wine/10 dark:border-white/10 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-wine/10 dark:border-white/10 mb-6">
              <div className="flex items-center gap-2">
                <Truck className="text-amber-500" size={20} />
                <h2 className="text-sm font-bold uppercase luxury-tracking tracking-[0.2em]">
                  {lang === 'ar' ? 'تتبع حالة الشحن والطلب' : 'TRACK YOUR ORDER'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-wine/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHasSearched(false);
                  }}
                  placeholder={lang === 'ar' ? 'أدخل رقم الطلب (#ORD-...) أو رقم الهاتف' : 'Enter Order ID (#ORD-...) or Phone'}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-wine/20 dark:border-white/20 p-3 text-xs font-mono font-bold text-wine dark:text-white focus:outline-none focus:border-amber-500 rtl:pr-10 rtl:pl-3 pl-10 pr-3"
                />
                <Search size={16} className="absolute rtl:right-3 rtl:left-auto left-3 top-3.5 text-zinc-400" />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-amber-500 text-wine font-bold uppercase text-[10px] luxury-tracking hover:bg-amber-400 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              >
                {lang === 'ar' ? 'بحث' : 'TRACK'}
              </button>
            </form>

            {/* Results Section */}
            {hasSearched && !searchedOrder && (
              <div className="py-8 text-center bg-zinc-50 dark:bg-white/5 border border-wine/10 dark:border-white/10 p-4">
                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-2" />
                <p className="text-xs font-bold uppercase text-wine dark:text-white mb-1">
                  {lang === 'ar' ? 'لم يتم العثور على أي طلب بهذة البيانات' : 'NO ORDER FOUND'}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-white/50">
                  {lang === 'ar' ? 'يرجى التأكد من كتابة رقم الهاتـف أو رقم الطلب الصحيح.' : 'Please double check your phone number or order reference.'}
                </p>
              </div>
            )}

            {searchedOrder && (
              <div className="space-y-6">
                {/* Order Meta Header */}
                <div className="p-4 bg-zinc-50 dark:bg-white/5 border border-wine/10 dark:border-white/10 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase font-mono block">
                      #{searchedOrder.id}
                    </span>
                    <span className="text-xs font-bold text-wine dark:text-white block mt-0.5">
                      {searchedOrder.customerName}
                    </span>
                  </div>
                  <div className="text-left rtl:text-right">
                    <span className="text-xs font-mono font-bold text-wine dark:text-white block">
                      {searchedOrder.totalAmount.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                    <span className="text-[9px] text-zinc-400 dark:text-white/40 block">
                      {new Date(searchedOrder.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>

                {/* Progress Steps Bar */}
                {searchedOrder.status === 'CANCELLED' ? (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-center font-bold text-xs uppercase">
                    {lang === 'ar' ? 'تم إلغاء هذا الطلب' : 'THIS ORDER HAS BEEN CANCELLED'}
                  </div>
                ) : (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-white/50 mb-3 block">
                      {lang === 'ar' ? 'مراحل توصيل الطلب:' : 'DELIVERY PROGRESS:'}
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { step: 1, labelAr: 'تم الاستلام', labelEn: 'Received', icon: Clock },
                        { step: 2, labelAr: 'قيد المعالجة', labelEn: 'Processing', icon: Package },
                        { step: 3, labelAr: 'جاري الشحن', labelEn: 'On the Way', icon: Truck },
                        { step: 4, labelAr: 'تم التسليم', labelEn: 'Delivered', icon: CheckCircle2 }
                      ].map((item) => {
                        const currentStep = getStatusStep(searchedOrder.status);
                        const isDone = item.step <= currentStep;
                        const ItemIcon = item.icon;

                        return (
                          <div key={item.step} className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                                isDone
                                  ? 'bg-amber-500 text-wine border-amber-500'
                                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-400 border-wine/10 dark:border-white/10'
                              }`}
                            >
                              <ItemIcon size={16} />
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase ${
                                isDone ? 'text-wine dark:text-white' : 'text-zinc-400 dark:text-white/30'
                              }`}
                            >
                              {lang === 'ar' ? item.labelAr : item.labelEn}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Customer Address Details */}
                <div className="text-[11px] space-y-1 text-zinc-600 dark:text-white/70 border-t border-wine/10 dark:border-white/10 pt-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-500 shrink-0" />
                    <span>{searchedOrder.governorate} - {searchedOrder.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="text-amber-500 shrink-0" />
                    <span>{searchedOrder.customerPhone}</span>
                  </div>
                </div>

                {/* Direct WhatsApp Support Button */}
                <a
                  href={`https://wa.me/2001022293420?text=${encodeURIComponent(
                    `مرحباً، أود الاستفسار عن طلب الشحن الخاص بي رقم #${searchedOrder.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-[10px] luxury-tracking flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle size={15} />
                  <span>{lang === 'ar' ? 'تواصل مع الدعم عبر الواتساب' : 'CONTACT SUPPORT VIA WHATSAPP'}</span>
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
