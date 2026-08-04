import { motion } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { 
  Package, User as UserIcon, Phone, Mail, Calendar, MapPin, 
  Edit2, LogOut, CheckCircle2, Clock, Ban, ArrowLeft, ShoppingBag, 
  ShieldCheck, Sun, Moon, DollarSign, Truck, AlertCircle, Save, Plus, Trash2, Search, MessageCircle, AlertTriangle
} from 'lucide-react';
import { User, Order } from '../types';
import { subscribeOrders } from '../lib/db';

interface CustomerDashboardProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onBackToStore: () => void;
  onViewAdmin?: () => void;
  onOpenAuth?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang?: 'en' | 'ar';
  initialTab?: 'overview' | 'orders' | 'profile' | 'addresses';
}

export default function CustomerDashboard({
  user,
  onUpdateUser,
  onLogout,
  onBackToStore,
  onViewAdmin,
  onOpenAuth,
  theme,
  onToggleTheme,
  lang = 'en',
  initialTab = 'orders'
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile' | 'addresses'>(initialTab);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Search & Track specific order (for guests or direct lookup)
  const [trackerQuery, setTrackerQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearchedTracker, setHasSearchedTracker] = useState(false);

  // Profile Edit Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<string[]>([]);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Update active tab if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [allOrdersList, setAllOrdersList] = useState<Order[]>([]);

  // Subscribe to real-time Firestore orders
  useEffect(() => {
    const unsub = subscribeOrders((orders) => {
      setAllOrdersList(orders);
      if (user) {
        const customerOrders = orders.filter(
          o => (o.userId && user?.id && o.userId === user.id) || (o.customerEmail && user?.email && o.customerEmail.toLowerCase() === user.email.toLowerCase())
        );
        setUserOrders(customerOrders);
      }
    });

    return () => unsub();
  }, [user]);

  // Sync Profile
  useEffect(() => {
    if (!user) return;
    
    setName(user.name || '');
    setPhone(user.phone || '');

    // Load saved addresses from localStorage or user data
    const storedAddresses = localStorage.getItem(`unknown_addresses_${user.id}`);
    if (storedAddresses) {
      try {
        setSavedAddresses(JSON.parse(storedAddresses));
      } catch (e) {
        setSavedAddresses([]);
      }
    } else {
      setSavedAddresses(['Cairo, Egypt']);
    }
  }, [user]);

  // Guest Order Tracker Search handler
  const handleGuestTrackerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerQuery.trim()) return;

    const query = trackerQuery.trim().toLowerCase();
    const found = allOrdersList.find(
      o =>
        o.id.toLowerCase() === query ||
        (o.customerPhone && o.customerPhone.replace(/\D/g, '').includes(query.replace(/\D/g, '')))
    );
    setSearchedOrder(found || null);
    setHasSearchedTracker(true);
  };

  // Render for Guest (Not Logged In) - Full Dashboard Page Order Tracker
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#050505] text-[#0a0a0a] dark:text-[#f5f5f7] flex flex-col font-sans">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-6 lg:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button
              onClick={onBackToStore}
              className="flex items-center gap-2 text-xs luxury-tracking font-bold uppercase text-zinc-600 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} /> {lang === 'ar' ? 'العودة للمتجر' : 'BACK TO STORE'}
            </button>
            <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block"></div>
            <span className="brand-logo text-lg tracking-widest uppercase text-zinc-900 dark:text-white hidden sm:block">
              AVENTO7 <span className="text-[9px] font-sans luxury-tracking text-amber-500 ml-1 font-bold">{lang === 'ar' ? 'قسم تتبع الشحنات' : 'ORDER TRACKER'}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              className="p-2 text-zinc-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="bg-amber-500 text-black px-4 py-2 text-[10px] luxury-tracking font-bold uppercase hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon size={14} />
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'SIGN IN'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Guest Tracking Main Section */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 my-6">
          <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 p-6 sm:p-10 shadow-xl space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-3">
                <Truck size={28} />
              </div>
              <h1 className="serif-display text-3xl sm:text-4xl uppercase tracking-wider text-zinc-900 dark:text-white">
                {lang === 'ar' ? 'تتبع حالة شحنتك المباشرة' : 'TRACK YOUR LIVE SHIPMENT'}
              </h1>
              <p className="text-xs luxury-tracking text-zinc-500 dark:text-white/50 uppercase">
                {lang === 'ar' ? 'أدخل رقم الهاتف المسجل في الطلب أو كود الطلب (#ORD-...) لمتابعة خط السير والتسليم' : 'ENTER YOUR REGISTERED PHONE OR ORDER ID TO TRACK DELIVERY STATUS'}
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleGuestTrackerSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={trackerQuery}
                  onChange={(e) => {
                    setTrackerQuery(e.target.value);
                    setHasSearchedTracker(false);
                  }}
                  placeholder={lang === 'ar' ? 'مثال: 01022293420 أو #ORD-759331' : 'E.G. 01022293420 OR #ORD-759331'}
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-black/20 dark:border-white/20 p-4 pl-12 text-sm font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
                <Search size={18} className="absolute left-4 top-4 text-zinc-400" />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-amber-500 text-black font-bold uppercase text-xs luxury-tracking tracking-[0.2em] hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-md"
              >
                <Search size={16} />
                <span>{lang === 'ar' ? 'تتبع الآن' : 'TRACK ORDER'}</span>
              </button>
            </form>

            {/* Result Area */}
            {hasSearchedTracker && !searchedOrder && (
              <div className="p-8 text-center bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 max-w-2xl mx-auto space-y-2">
                <AlertTriangle size={36} className="mx-auto text-amber-500" />
                <h3 className="text-sm font-bold uppercase text-zinc-900 dark:text-white">
                  {lang === 'ar' ? 'لم نتمكن من العثور على أي طلب مطابق' : 'NO ORDER FOUND MATCHING YOUR QUERY'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-white/50 max-w-md mx-auto">
                  {lang === 'ar' ? 'يرجى التثبت من إدخال رقم الهاتف الصحيح أو رقم الطلب الموجود في رسالة التأكيد.' : 'Please verify you typed the correct phone number or order reference ID.'}
                </p>
              </div>
            )}

            {searchedOrder && (
              <div className="max-w-2xl mx-auto space-y-6 bg-zinc-50/50 dark:bg-[#050505] p-6 border border-black/10 dark:border-white/10 shadow-inner">
                {/* Meta Header */}
                <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 block">
                      #{searchedOrder.id}
                    </span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white block mt-0.5">
                      {searchedOrder.customerName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-zinc-900 dark:text-white block">
                      {searchedOrder.totalAmount.toLocaleString()} EGP
                    </span>
                    <span className="text-[10px] text-zinc-400 dark:text-white/40 block">
                      {new Date(searchedOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Progress Tracker */}
                <div>
                  <span className="text-xs font-bold uppercase text-zinc-500 dark:text-white/50 mb-4 block">
                    {lang === 'ar' ? 'مراحل شحن وتوصيل الطلب:' : 'DELIVERY PROGRESS:'}
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { step: 1, labelAr: 'تم الاستلام', labelEn: 'Received', icon: Clock },
                      { step: 2, labelAr: 'قيد المعالجة', labelEn: 'Processing', icon: Package },
                      { step: 3, labelAr: 'جاري الشحن', labelEn: 'On the Way', icon: Truck },
                      { step: 4, labelAr: 'تم التسليم', labelEn: 'Delivered', icon: CheckCircle2 }
                    ].map((item) => {
                      const stepNum = searchedOrder.status === 'COMPLETED' ? 4 : searchedOrder.status === 'PENDING' ? 1 : 2;
                      const isDone = item.step <= stepNum;
                      const ItemIcon = item.icon;

                      return (
                        <div key={item.step} className="flex flex-col items-center gap-1.5">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                              isDone
                                ? 'bg-amber-500 text-black border-amber-500 font-bold'
                                : 'bg-zinc-100 dark:bg-white/5 text-zinc-400 border-black/10 dark:border-white/10'
                            }`}
                          >
                            <ItemIcon size={18} />
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              isDone ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-white/30'
                            }`}
                          >
                            {lang === 'ar' ? item.labelAr : item.labelEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Address and details */}
                <div className="text-xs space-y-1.5 text-zinc-600 dark:text-white/70 border-t border-black/10 dark:border-white/10 pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-amber-500 shrink-0" />
                    <span>{searchedOrder.governorate} - {searchedOrder.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-amber-500 shrink-0" />
                    <span>{searchedOrder.customerPhone}</span>
                  </div>
                </div>

                {/* WhatsApp button */}
                <a
                  href={`https://wa.me/2001022293420?text=${encodeURIComponent(
                    `مرحباً 👋 أود الاستفسار عن طلب الشحن رقم #${searchedOrder.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase text-xs luxury-tracking flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <MessageCircle size={18} />
                  <span>{lang === 'ar' ? 'تواصل مع الدعم عبر الواتساب' : 'CONTACT SUPPORT VIA WHATSAPP'}</span>
                </a>
              </div>
            )}

            {/* Account Banner */}
            <div className="pt-6 border-t border-black/10 dark:border-white/10 text-center space-y-3">
              <p className="text-xs luxury-tracking uppercase text-zinc-500 dark:text-white/50">
                {lang === 'ar' ? 'هل تملك حساباً في المتجر؟ سجّل الدخول لعرض جميع طلباتك السابقة تلقائياً' : 'HAVE AN ACCOUNT? SIGN IN TO AUTOMATICALLY ACCESS ALL YOUR ORDERS'}
              </p>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-6 py-2.5 border border-black/20 dark:border-white/20 text-xs font-bold uppercase hover:border-amber-500 transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'SIGN IN / REGISTER'}
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate Metrics
  const totalOrdersCount = userOrders.length;
  const pendingOrdersCount = userOrders.filter(o => o.status === 'PENDING').length;
  const completedOrdersCount = userOrders.filter(o => o.status === 'COMPLETED').length;
  const totalSpent = userOrders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const filteredOrders = userOrders.filter(o => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedUser: User = {
      ...user,
      name,
      phone
    };

    // Update in local storage registered users array
    const usersStr = localStorage.getItem('unknown_users');
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const updatedUsers = users.map((u: any) => u.id === user.id ? { ...u, name, phone } : u);
        localStorage.setItem('unknown_users', JSON.stringify(updatedUsers));
      } catch (e) {
        console.error(e);
      }
    }

    onUpdateUser(updatedUser);
    setIsEditingProfile(false);
    showNotification('PROFILE UPDATED SUCCESSFULLY');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressInput.trim()) return;
    const updated = [...savedAddresses, newAddressInput.trim()];
    setSavedAddresses(updated);
    localStorage.setItem(`unknown_addresses_${user.id}`, JSON.stringify(updated));
    setNewAddressInput('');
    showNotification('NEW DELIVERY ADDRESS SAVED');
  };

  const handleDeleteAddress = (index: number) => {
    const updated = savedAddresses.filter((_, i) => i !== index);
    setSavedAddresses(updated);
    localStorage.setItem(`unknown_addresses_${user.id}`, JSON.stringify(updated));
    showNotification('ADDRESS REMOVED');
  };

  const handleCancelOrder = (orderId: string) => {
    const ordersStr = localStorage.getItem('unknown_orders');
    if (ordersStr) {
      try {
        const allOrders: Order[] = JSON.parse(ordersStr);
        const updatedOrders = allOrders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o);
        localStorage.setItem('unknown_orders', JSON.stringify(updatedOrders));
        
        // Update local state
        setUserOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' as const } : o));
        showNotification('ORDER CANCELLATION REQUESTED');
      } catch (e) {
        console.error(e);
      }
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#050505] text-[#0a0a0a] dark:text-[#f5f5f7] flex flex-col font-sans transition-colors duration-500">
      
      {/* Dedicated Portal Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#050505]/90 backdrop-blur-md border-b border-black/10 dark:border-white/10 px-6 lg:px-12 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs luxury-tracking font-bold uppercase text-zinc-600 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> {lang === 'ar' ? 'العودة للمتجر' : 'BACK TO STORE'}
          </button>
          <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 hidden sm:block"></div>
          <span className="brand-logo text-lg tracking-widest uppercase text-zinc-900 dark:text-white hidden sm:block">
            AVENTO7 <span className="text-[9px] font-sans luxury-tracking text-zinc-400 dark:text-white/40 ml-1 font-semibold">{lang === 'ar' ? 'بوابة العملاء' : 'CLIENT PORTAL'}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 text-zinc-600 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 border-l border-black/10 dark:border-white/10 pl-4 text-xs luxury-tracking font-semibold">
            <div className="w-7 h-7 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs font-mono">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <span className="uppercase text-zinc-900 dark:text-white font-bold">{(user?.name || 'CLIENT').split(' ')[0]}</span>
          </div>

          <button
            onClick={onLogout}
            className="text-xs luxury-tracking uppercase text-rose-600 dark:text-rose-400 font-bold hover:opacity-80 transition-opacity flex items-center gap-1 border border-rose-500/20 px-3 py-1.5"
          >
            <LogOut size={13} /> {lang === 'ar' ? 'خروج' : 'LOGOUT'}
          </button>
        </div>
      </header>

      {/* Admin Quick Switch Alert Bar */}
      {user?.role === 'admin' && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-700 dark:text-amber-400">
          <div className="flex items-center gap-2 text-xs luxury-tracking font-bold uppercase">
            <ShieldCheck size={18} />
            <span>{lang === 'ar' ? 'حساب مسؤول النظام - يمكنك التحكم الكامل بالموقع والمنتجات والطلبات والعملاء' : 'ADMINISTRATOR ACCOUNT - YOU HAVE FULL CONTROL OVER STORE, PRODUCTS & ORDERS'}</span>
          </div>
          {onViewAdmin && (
            <button
              onClick={onViewAdmin}
              className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] luxury-tracking uppercase transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{lang === 'ar' ? 'فتح لوحة التحكم (ADMIN PANEL)' : 'OPEN ADMIN PANEL'}</span>
              <ShieldCheck size={15} />
            </button>
          )}
        </div>
      )}

      {/* Main Dedicated Account Portal Container */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 lg:h-[calc(100vh-65px)] lg:overflow-hidden">
        
        {/* SIDEBAR MENU (Fixed/Static on Desktop, Segmented Mobile Layout) */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5 lg:h-full lg:overflow-y-auto custom-scrollbar">
          
          {/* Client Profile Summary Card */}
          <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 p-5 sm:p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-900 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xl font-mono border border-black/10 dark:border-white/10 shadow-inner flex-shrink-0">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] sm:text-[10px] luxury-tracking text-amber-600 dark:text-amber-400 font-bold uppercase flex items-center gap-1">
                  <ShieldCheck size={13} /> VIP CLIENT MEMBER
                </span>
                <h3 className="serif-display text-lg sm:text-xl tracking-wide uppercase text-zinc-900 dark:text-white font-normal truncate mt-0.5">
                  {user?.name || 'VIP CLIENT'}
                </h3>
                <span className="text-[10px] sm:text-[11px] luxury-tracking text-zinc-500 dark:text-white/40 font-mono truncate">{user?.email || ''}</span>
              </div>
            </div>

            <div className="border-t border-black/5 dark:border-white/5 pt-3 text-[10px] luxury-tracking flex justify-between items-center text-zinc-500 dark:text-white/50">
              <span className="font-semibold">PHONE NUMBER:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">{user.phone || 'NOT PROVIDED'}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 p-1.5 sm:p-2 grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-col gap-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center lg:justify-start gap-2.5 px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] luxury-tracking uppercase font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <Package size={15} />
              <span className="truncate">OVERVIEW</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-center lg:justify-between gap-2.5 px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] luxury-tracking uppercase font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <ShoppingBag size={15} />
                <span className="truncate">MY ORDERS</span>
              </div>
              <span className={`hidden lg:inline text-[9px] font-mono px-1.5 py-0.5 font-bold ${
                activeTab === 'orders' ? 'bg-white/20 dark:bg-black/20 text-current' : 'bg-black/5 dark:bg-white/10 text-zinc-700 dark:text-white'
              }`}>
                {totalOrdersCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center justify-center lg:justify-start gap-2.5 px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] luxury-tracking uppercase font-bold transition-all ${
                activeTab === 'addresses'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <MapPin size={15} />
              <span className="truncate">ADDRESSES</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-center lg:justify-start gap-2.5 px-3 sm:px-4 py-3 text-[10px] sm:text-[11px] luxury-tracking uppercase font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                  : 'text-zinc-600 dark:text-white/60 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
              }`}
            >
              <UserIcon size={15} />
              <span className="truncate">SETTINGS</span>
            </button>
          </nav>

          {/* Concierge Banner */}
          <div className="hidden sm:flex bg-zinc-100/80 dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 p-5 flex-col gap-2.5 text-[10px] luxury-tracking">
            <span className="font-bold uppercase text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Clock size={13} className="text-amber-500" /> CONCIERGE SUPPORT
            </span>
            <p className="text-zinc-500 dark:text-white/50 leading-relaxed uppercase">
              Need assistance with an order or custom sizing? Our concierge team is at your service 24/7.
            </p>
            <span className="font-mono text-zinc-900 dark:text-white font-bold mt-1">SUPPORT@AVENTO7.COM</span>
          </div>

        </aside>

        {/* MAIN CONTENT WORKSPACE (Independent scrolling container on desktop) */}
        <main className="flex-1 flex flex-col gap-6 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-2">

          {/* Global Toast Success Message */}
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs luxury-tracking uppercase font-bold flex items-center gap-3 shadow-sm"
            >
              <CheckCircle2 size={16} /> {successMsg}
            </motion.div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-8">
              
              {/* Header Greeting */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                <div>
                  <span className="text-[9px] luxury-tracking uppercase text-zinc-400 dark:text-white/40 block mb-1 font-semibold">CLIENT DASHBOARD OVERVIEW</span>
                  <h1 className="serif-display text-3xl md:text-4xl tracking-widest text-zinc-900 dark:text-white uppercase font-light">
                    WELCOME BACK, {user.name}
                  </h1>
                  <p className="text-xs luxury-tracking text-zinc-500 dark:text-white/50 uppercase mt-2">
                    MANAGE YOUR RECENT ORDERS, TRACK SHIPMENTS, AND EDIT ACCOUNT PREFERENCES.
                  </p>
                </div>

                <button
                  onClick={onBackToStore}
                  className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 text-[10px] luxury-tracking font-bold uppercase hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
                >
                  <ShoppingBag size={14} /> BROWSE NEW COLLECTION
                </button>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-6 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center text-zinc-400 dark:text-white/40">
                    <span className="text-[9px] luxury-tracking uppercase font-bold">TOTAL ORDERS</span>
                    <ShoppingBag size={16} />
                  </div>
                  <span className="font-mono text-3xl font-bold text-zinc-900 dark:text-white">{totalOrdersCount}</span>
                  <span className="text-[9px] luxury-tracking text-zinc-400 uppercase font-medium">LIFETIME ORDERS PLACED</span>
                </div>

                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-6 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center text-zinc-400 dark:text-white/40">
                    <span className="text-[9px] luxury-tracking uppercase font-bold">ACTIVE DELIVERIES</span>
                    <Truck size={16} className="text-amber-500" />
                  </div>
                  <span className="font-mono text-3xl font-bold text-amber-600 dark:text-amber-400">{pendingOrdersCount}</span>
                  <span className="text-[9px] luxury-tracking text-zinc-400 uppercase font-medium">IN PROCESSING / IN TRANSIT</span>
                </div>

                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-6 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center text-zinc-400 dark:text-white/40">
                    <span className="text-[9px] luxury-tracking uppercase font-bold">COMPLETED ORDERS</span>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </div>
                  <span className="font-mono text-3xl font-bold text-emerald-600 dark:text-emerald-400">{completedOrdersCount}</span>
                  <span className="text-[9px] luxury-tracking text-zinc-400 uppercase font-medium">DELIVERED SUCCESSFULLY</span>
                </div>

                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-6 flex flex-col gap-2 shadow-sm">
                  <div className="flex justify-between items-center text-zinc-400 dark:text-white/40">
                    <span className="text-[9px] luxury-tracking uppercase font-bold">TOTAL SPENT</span>
                    <DollarSign size={16} />
                  </div>
                  <span className="font-mono text-3xl font-bold text-zinc-900 dark:text-white">{totalSpent.toLocaleString()} EGP</span>
                  <span className="text-[9px] luxury-tracking text-zinc-400 uppercase font-medium">PURCHASE TOTAL</span>
                </div>
              </div>

              {/* Recent Orders Preview Block */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
                <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                  <div>
                    <h3 className="text-xs luxury-tracking font-bold uppercase text-zinc-900 dark:text-white">MOST RECENT ORDERS</h3>
                    <p className="text-[10px] luxury-tracking text-zinc-400 uppercase mt-0.5">LATEST PURCHASES AND ORDER STATUSES</p>
                  </div>
                  {userOrders.length > 0 && (
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-[10px] luxury-tracking uppercase font-bold text-zinc-600 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                    >
                      VIEW ALL ORDERS ({totalOrdersCount}) →
                    </button>
                  )}
                </div>

                {userOrders.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
                    <Package size={36} className="text-zinc-300 dark:text-white/20" />
                    <span className="serif-display text-xl uppercase font-light text-zinc-900 dark:text-white">NO RECENT ORDERS</span>
                    <p className="text-[10px] luxury-tracking text-zinc-500 uppercase max-w-xs">
                      You haven't placed any orders yet. Explore our luxury collection today.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {userOrders.slice(0, 3).map((ord, idx) => (
                      <div key={`${ord.id}-${idx}`} className="p-4 bg-zinc-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-black/5 dark:bg-white/5 flex items-center justify-center text-zinc-900 dark:text-white font-mono text-xs font-bold">
                            #{ord.id.substring(0, 4)}
                          </div>
                          <div className="flex flex-col text-[10px] luxury-tracking">
                            <span className="font-bold text-zinc-900 dark:text-white uppercase font-mono">ORDER #{ord.id}</span>
                            <span className="text-zinc-400 uppercase font-medium">{new Date(ord.createdAt).toLocaleDateString()} • {ord.items.length} ITEM(S)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-[10px] luxury-tracking w-full sm:w-auto justify-between sm:justify-end">
                          <span className={`px-2.5 py-1 uppercase font-bold border ${
                            ord.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                            ord.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            {ord.status}
                          </span>
                          <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">{ord.totalAmount.toLocaleString()} EGP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-black/10 dark:border-white/10 pb-6">
                <div>
                  <h2 className="serif-display text-2xl uppercase tracking-widest text-zinc-900 dark:text-white font-light">
                    MY ORDERS HISTORY
                  </h2>
                  <p className="text-[10px] luxury-tracking text-zinc-400 uppercase mt-1">TRACK AND MANAGE ALL YOUR ORDERS</p>
                </div>

                {/* Status Filter Buttons */}
                <div className="flex items-center gap-2 flex-wrap text-[9px] luxury-tracking font-bold uppercase">
                  {(['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 transition-colors border ${
                        orderFilter === st
                          ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                          : 'border-black/10 dark:border-white/10 text-zinc-500 dark:text-white/50 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
                  <Package size={44} className="text-zinc-300 dark:text-white/20" />
                  <h3 className="serif-display text-2xl uppercase font-light text-zinc-900 dark:text-white">NO ORDERS FOUND</h3>
                  <p className="text-[10px] luxury-tracking text-zinc-500 uppercase max-w-sm">
                    No orders match the selected status filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map((ord, idx) => (
                    <div 
                      key={`${ord.id}-${idx}`} 
                      className="bg-zinc-50/70 dark:bg-[#050505] border border-black/10 dark:border-white/10 p-6 flex flex-col gap-6 shadow-sm"
                    >
                      {/* Order Header */}
                      <div className="flex flex-wrap justify-between items-start border-b border-black/10 dark:border-white/10 pb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-bold text-zinc-900 dark:text-white">ORDER #{ord.id}</span>
                            <span className={`text-[9px] luxury-tracking uppercase font-bold px-2.5 py-0.5 border ${
                              ord.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                              ord.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <span className="text-[9px] luxury-tracking text-zinc-400 block mt-1 flex items-center gap-1 font-medium">
                            <Calendar size={11} /> PLACED ON: {new Date(ord.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {ord.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelOrder(ord.id)}
                            className="text-[9px] luxury-tracking uppercase text-rose-600 dark:text-rose-400 border border-rose-500/30 px-3 py-1.5 hover:bg-rose-500/10 transition-colors flex items-center gap-1 font-bold"
                          >
                            <Ban size={12} /> CANCEL ORDER
                          </button>
                        )}
                      </div>

                      {/* Delivery Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] luxury-tracking bg-white dark:bg-[#0A0A0A] p-4 border border-black/5 dark:border-white/5">
                        <div>
                          <span className="text-zinc-400 block uppercase font-bold mb-1">CONTACT PHONE NUMBER</span>
                          <span className="font-mono font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <Phone size={12} className="text-amber-500" /> {ord.customerPhone}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block uppercase font-bold mb-1">DELIVERY ADDRESS</span>
                          <span className="font-medium text-zinc-800 dark:text-white/90 flex items-center gap-1.5">
                            <MapPin size={12} className="text-amber-500" /> {ord.address}
                          </span>
                        </div>
                      </div>

                      {/* Order Status Progress Tracker Bar */}
                      {ord.status !== 'CANCELLED' ? (
                        <div className="bg-white dark:bg-[#0A0A0A] p-4 border border-black/5 dark:border-white/5 flex flex-col gap-3">
                          <span className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 font-bold uppercase">SHIPMENT STATUS TRACKER:</span>
                          <div className="grid grid-cols-4 gap-2 text-[9px] luxury-tracking text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">✓</div>
                              <span className="font-bold text-zinc-900 dark:text-white">ORDER PLACED</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                ord.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'
                              }`}>
                                {ord.status === 'COMPLETED' ? '✓' : '2'}
                              </div>
                              <span className="font-bold text-zinc-900 dark:text-white">PROCESSING</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                ord.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-white/10 text-zinc-400'
                              }`}>
                                {ord.status === 'COMPLETED' ? '✓' : '3'}
                              </div>
                              <span className={`font-bold ${ord.status === 'COMPLETED' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-white/30'}`}>IN TRANSIT</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                ord.status === 'COMPLETED' ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-white/10 text-zinc-400'
                              }`}>
                                {ord.status === 'COMPLETED' ? '✓' : '4'}
                              </div>
                              <span className={`font-bold ${ord.status === 'COMPLETED' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-white/30'}`}>DELIVERED</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-3 text-[10px] luxury-tracking text-rose-600 dark:text-rose-400 uppercase font-bold flex items-center gap-2">
                          <Ban size={14} /> THIS ORDER WAS CANCELLED BY CLIENT
                        </div>
                      )}

                      {/* Order Items */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 font-bold uppercase">ORDER ITEMS ({ord.items.length}):</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-white dark:bg-[#0A0A0A] p-3 border border-black/5 dark:border-white/5">
                              <img src={item.image} alt={item.name} className="w-14 h-16 object-cover flex-shrink-0" />
                              <div className="flex flex-col text-[10px] luxury-tracking">
                                <span className="font-bold text-zinc-900 dark:text-white line-clamp-1">{item.name}</span>
                                <span className="text-zinc-400">SIZE: {item.size} | QTY: {item.quantity}</span>
                                <span className="font-mono text-zinc-900 dark:text-white font-bold mt-1">{(item.price * item.quantity).toLocaleString()} EGP</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Bar */}
                      <div className="flex justify-between items-center border-t border-black/10 dark:border-white/10 pt-4 text-[11px] luxury-tracking">
                        <span className="text-zinc-500 dark:text-white/50 font-semibold uppercase">PAYMENT METHOD: CASH ON DELIVERY</span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 dark:text-white/50 font-semibold">TOTAL AMOUNT:</span>
                          <span className="text-xl font-mono font-bold text-zinc-900 dark:text-white">{ord.totalAmount.toLocaleString()} EGP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DELIVERY ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
              <div className="border-b border-black/10 dark:border-white/10 pb-4">
                <h2 className="serif-display text-2xl uppercase tracking-widest text-zinc-900 dark:text-white font-light">
                  SAVED DELIVERY ADDRESSES
                </h2>
                <p className="text-[10px] luxury-tracking text-zinc-400 uppercase mt-1">MANAGE ADDRESSES FOR QUICK EXPRES CHECKOUT</p>
              </div>

              {/* Add New Address Form */}
              <form onSubmit={handleAddAddress} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newAddressInput}
                  onChange={(e) => setNewAddressInput(e.target.value)}
                  placeholder="ENTER NEW ADDRESS (CITY, STREET, BUILDING, APARTMENT)..."
                  className="flex-1 bg-zinc-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 p-3 text-xs luxury-tracking font-medium text-zinc-900 dark:text-white focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 text-[10px] luxury-tracking font-bold uppercase hover:opacity-90 transition-opacity flex items-center gap-2 justify-center"
                >
                  <Plus size={14} /> ADD ADDRESS
                </button>
              </form>

              {/* Saved Address List */}
              <div className="flex flex-col gap-3 mt-2">
                {savedAddresses.map((addr, idx) => (
                  <div key={idx} className="p-4 bg-zinc-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 flex justify-between items-center text-xs luxury-tracking">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-amber-500 flex-shrink-0" />
                      <span className="font-medium text-zinc-900 dark:text-white uppercase">{addr}</span>
                      {idx === 0 && (
                        <span className="text-[9px] bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 font-bold uppercase">DEFAULT</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(idx)}
                      className="text-rose-600 dark:text-rose-400 hover:opacity-70 transition-opacity p-1"
                      title="Remove address"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ACCOUNT SETTINGS / PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-6 lg:p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                  <h2 className="serif-display text-2xl uppercase tracking-widest text-zinc-900 dark:text-white font-light">
                    ACCOUNT SETTINGS & PROFILE
                  </h2>
                  <p className="text-[10px] luxury-tracking text-zinc-400 uppercase mt-1">PERSONAL DETAILS AND CONTACT INFORMATION</p>
                </div>

                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-[10px] luxury-tracking uppercase text-zinc-600 dark:text-white/60 hover:text-black dark:hover:text-white flex items-center gap-1 font-bold border border-black/10 dark:border-white/10 px-4 py-2"
                  >
                    <Edit2 size={13} /> EDIT PROFILE
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="max-w-xl flex flex-col gap-6 text-xs luxury-tracking">
                  <div className="flex flex-col gap-2">
                    <label className="text-zinc-500 dark:text-white/50 font-bold uppercase">FULL NAME *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-zinc-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 p-3 text-zinc-900 dark:text-white font-medium focus:outline-none uppercase"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-zinc-500 dark:text-white/50 font-bold uppercase">PHONE NUMBER *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+20100000000"
                      className="bg-zinc-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 p-3 text-zinc-900 dark:text-white font-medium focus:outline-none uppercase"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-zinc-400 dark:text-white/30 font-bold uppercase">EMAIL ADDRESS (CANNOT BE CHANGED)</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-zinc-100 dark:bg-white/5 p-3 text-zinc-400 dark:text-white/30 font-mono cursor-not-allowed border border-black/5 dark:border-white/5"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white dark:bg-white dark:text-black py-3.5 font-bold uppercase text-[10px] luxury-tracking hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <Save size={14} /> SAVE CHANGES
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setName(user.name || '');
                        setPhone(user.phone || '');
                      }}
                      className="px-6 border border-black/20 dark:border-white/20 py-3.5 uppercase text-[10px] luxury-tracking font-bold text-zinc-600 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              ) : (
                <div className="max-w-2xl flex flex-col gap-6 text-xs luxury-tracking">
                  <div className="flex flex-col gap-1 border-b border-black/5 dark:border-white/5 pb-4">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold">CLIENT NAME</span>
                    <span className="font-bold text-zinc-900 dark:text-white text-base">{user.name}</span>
                  </div>

                  <div className="flex flex-col gap-1 border-b border-black/5 dark:border-white/5 pb-4">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold">REGISTERED EMAIL ADDRESS</span>
                    <span className="font-mono text-zinc-800 dark:text-white/90">{user.email}</span>
                  </div>

                  <div className="flex flex-col gap-1 border-b border-black/5 dark:border-white/5 pb-4">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold">CONTACT PHONE NUMBER</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                      <Phone size={14} /> {user.phone || 'NO PHONE ADDED'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold">ACCOUNT ROLE</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white uppercase">{user.role || 'VIP CUSTOMER'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
