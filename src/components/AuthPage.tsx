import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sun, Moon, ShieldCheck, Sparkles, CheckCircle, UserCheck, MapPin, Phone as PhoneIcon } from 'lucide-react';
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { User } from '../types';
import { saveUser, db, collection, getDocs } from '../lib/db';
import { EGYPT_GOVERNORATES } from '../constants/governorates';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onBackToStore: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  lang?: 'en' | 'ar';
}

export default function AuthPage({
  onLogin,
  onBackToStore,
  theme,
  onToggleTheme,
  lang = 'en'
}: AuthPageProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const loginTabRef = useRef<HTMLButtonElement>(null);
  const registerTabRef = useRef<HTMLButtonElement>(null);
  const [tabLine, setTabLine] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeBtn = view === 'login' ? loginTabRef.current : registerTabRef.current;
    if (activeBtn) {
      setTabLine({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      });
    }
  }, [view, lang]);

  useEffect(() => {
    const handleResize = () => {
      const activeBtn = view === 'login' ? loginTabRef.current : registerTabRef.current;
      if (activeBtn) {
        setTabLine({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();

    if (view === 'login') {
      if (!cleanEmail || !password) {
        setError(lang === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'PLEASE ENTER BOTH EMAIL AND PASSWORD.');
        return;
      }
      
      if (cleanEmail === 'admin' || cleanEmail === 'admin@avento.com' || cleanEmail === 'a73905337@gmail.com') {
        if (password === '1234' || password.toLowerCase() === 'admin123') {
          const adminUser = { id: 'admin-1', name: 'System Admin', email: cleanEmail === 'admin' ? 'admin@avento.com' : cleanEmail, role: 'admin' as const };
          onLogin(adminUser);
          return;
        }
      }

      // Fetch Registered Accounts from Firestore & LocalStorage
      let users: any[] = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
      } catch (err) {
        console.error('Firestore users fetch error:', err);
      }

      if (users.length === 0) {
        const usersStr = localStorage.getItem('unknown_users');
        if (usersStr) users = JSON.parse(usersStr);
      }

      const user = users.find((u: any) => u.email && u.email.toLowerCase() === cleanEmail);

      if (!user) {
        setError(lang === 'ar' ? 'الحساب غير موجود. يمكنك إنشاء حساب جديد عبر تبويب "إنشاء حساب".' : 'ACCOUNT NOT FOUND. YOU CAN CREATE A NEW ACCOUNT UNDER "CREATE ACCOUNT".');
        return;
      }

      if (user.isArchived) {
        setError(lang === 'ar' ? 'تم إيقاف هذا الحساب. يرجى التواصل مع الدعم.' : 'THIS ACCOUNT HAS BEEN SUSPENDED. PLEASE CONTACT SUPPORT.');
        return;
      }

      if (user.password !== password) {
        setError(lang === 'ar' ? 'كلمة المرور غير صحيحة.' : 'INCORRECT PASSWORD. PLEASE TRY AGAIN.');
        return;
      }

      // Successful Login
      const loggedUser: User = { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        role: ((user.email.toLowerCase() === 'a73905337@gmail.com' || user.email.toLowerCase() === 'admin@avento.com' || user.role === 'admin') ? 'admin' : 'user') as 'admin' | 'user', 
        createdAt: user.createdAt 
      };
      onLogin(loggedUser);
    } else {
      // Registration Logic
      if (!name.trim() || !phone.trim() || !cleanEmail || !password) {
        setError(lang === 'ar' ? 'جميع الحقول مطلوبة.' : 'ALL FIELDS INCLUDING FULL NAME AND PHONE ARE REQUIRED.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setError(lang === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح.' : 'PLEASE ENTER A VALID EMAIL ADDRESS.');
        return;
      }

      if (password.length < 4) {
        setError(lang === 'ar' ? 'يجب أن تتكون كلمة المرور من 4 أحرف على الأقل.' : 'PASSWORD MUST BE AT LEAST 4 CHARACTERS LONG.');
        return;
      }

      let users: any[] = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
      } catch (err) {
        console.error('Firestore users fetch error:', err);
      }

      if (users.length === 0) {
        const usersStr = localStorage.getItem('unknown_users') || '[]';
        users = JSON.parse(usersStr);
      }
      
      const existing = users.find((u: any) => u.email && u.email.toLowerCase() === cleanEmail);
      if (existing) {
        setError(lang === 'ar' ? 'يوجد حساب مسجل بهذا البريد بالفعل. الرجاء تسجيل الدخول.' : 'AN ACCOUNT ALREADY EXISTS WITH THIS EMAIL. PLEASE LOGIN INSTEAD.');
        return;
      }

      const formattedPhone = phone.trim().startsWith('+20') 
        ? phone.trim() 
        : `+20 ${phone.trim().replace(/^0+/, '')}`;

      const newUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        phone: formattedPhone,
        governorate: governorate || 'القاهرة',
        password,
        role: ((cleanEmail === 'a73905337@gmail.com' || cleanEmail === 'admin@avento.com') ? 'admin' : 'user') as 'admin' | 'user',
        createdAt: new Date().toISOString()
      };

      // Save to Cloud Firestore permanently
      await saveUser(newUser);

      // Backup to localStorage
      users.push(newUser);
      localStorage.setItem('unknown_users', JSON.stringify(users));

      const loggedUser: User = { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        phone: newUser.phone, 
        governorate: newUser.governorate,
        role: (newUser.email.toLowerCase() === 'a73905337@gmail.com' || newUser.email.toLowerCase() === 'admin@avento.com' || newUser.role === 'admin') ? 'admin' : 'user',
        createdAt: newUser.createdAt 
      };
      onLogin(loggedUser);
    }
  };

  const switchView = (newView: 'login' | 'register') => {
    setView(newView);
    setError('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setGovernorate('القاهرة');
  };

  return (
    <div className="min-h-screen w-full bg-[#fdfbfd] text-[#30001A] dark:bg-[#060204] dark:text-[#f8f1f5] flex flex-col justify-between relative transition-colors duration-500 overflow-x-hidden">
      
      {/* Top Floating Navigation Header */}
      <header className="w-full px-4 sm:px-6 md:px-12 py-6 flex items-center justify-between z-30 relative">
        <div className="flex-1 flex justify-start">
          <button
            onClick={onBackToStore}
            className="flex items-center justify-center w-10 h-10 rounded-full text-[#30001A] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <ArrowLeft size={18} className="rtl:rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <a href="#" onClick={onBackToStore} className="brand-logo flex-1 text-center text-xl sm:text-2xl font-black luxury-tracking tracking-[0.25em] text-[#30001A] dark:text-white shrink-0">
          AVENTO7
        </a>

        <div className="flex-1 flex justify-end">
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-current cursor-pointer"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Luxury Content Grid */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Editorial Brand Visual & Showcase (7 Cols on Desktop) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 hidden lg:flex flex-col justify-between relative rounded-2xl overflow-hidden min-h-[620px] bg-[#30001A] text-white p-12 shadow-2xl border border-[#30001A]/30 group"
        >
          {/* Background Editorial Image with Luxury Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1600"
              alt="Avento7 Luxury Fashion"
              className="w-full h-full object-cover object-center opacity-45 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b000f] via-[#30001A]/60 to-transparent" />
          </div>

          {/* Top Brand Watermark */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] luxury-tracking font-mono tracking-[0.3em] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              MENSWEAR SS26
            </span>
            <Sparkles size={20} className="text-amber-300 animate-pulse" />
          </div>

          {/* Bottom Editorial Copy */}
          <div className="relative z-10 max-w-lg space-y-6">
            <h1 className="serif-display text-3xl md:text-4xl xl:text-5xl font-light tracking-wide leading-tight">
              {lang === 'ar' ? 'عالم من الفخامة والتميز الفريد' : 'ENTER THE REALM OF ESSENTIAL LUXURY'}
            </h1>
            <p className="text-sm font-light text-zinc-200/90 leading-relaxed font-sans">
              {lang === 'ar'
                ? 'استمتع بتجربة تسوق حصرية، تتبع طلبيتك بدقة، واحصل على أحدث الإصدارات الخاصة بأعضاء AVENTO7 قبل الجميع.'
                : 'Unlock personalized order tracking, priority checkout, private drop invitations, and an exclusive curation tailored for modern elegance.'}
            </p>

            <div className="pt-4 grid grid-cols-2 gap-4 border-t border-white/15 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-rose-300 shrink-0" />
                <span>{lang === 'ar' ? 'تتبع فوري للشحنات' : 'Instant Order Tracking'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-rose-300 shrink-0" />
                <span>{lang === 'ar' ? 'قطع حصرية محدودة' : 'Exclusive Private Drops'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Auth Form Container (5 Cols on Desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 w-full max-w-lg mx-auto bg-white dark:bg-[#0c0508] border border-black/10 dark:border-white/10 p-8 sm:p-12 shadow-2xl rounded-2xl relative"
        >
          {/* Header & Tabs */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[10px] luxury-tracking font-bold text-[#30001A] dark:text-rose-300 mb-2 tracking-[0.25em]">
              <UserCheck size={14} />
              <span>{lang === 'ar' ? 'البوابة الحصرية' : 'EXCLUSIVE ACCESS'}</span>
            </div>
            
            <h2 className="serif-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-widest text-[#30001A] dark:text-white mb-6 flex flex-row items-center gap-2 whitespace-nowrap">
              {view === 'login' ? (lang === 'ar' ? 'تسجيل الدخول' : 'SIGN IN') : (lang === 'ar' ? 'إنشاء حساب' : 'CREATE ACCOUNT')}
            </h2>

            {/* Tab Switchers */}
            <div className="flex border-b border-black/10 dark:border-white/10 text-xs luxury-tracking font-medium relative gap-2 sm:gap-4">
              <button
                ref={loginTabRef}
                type="button"
                onClick={() => switchView('login')}
                className={`pb-3.5 px-3 sm:px-4 font-bold tracking-[0.2em] transition-colors relative cursor-pointer ${
                  view === 'login'
                    ? 'text-[#30001A] dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'SIGN IN'}</span>
              </button>

              <button
                ref={registerTabRef}
                type="button"
                onClick={() => switchView('register')}
                className={`pb-3.5 px-3 sm:px-4 font-bold tracking-[0.2em] transition-colors relative cursor-pointer ${
                  view === 'register'
                    ? 'text-[#30001A] dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>{lang === 'ar' ? 'إنشاء حساب جديد' : 'REGISTER'}</span>
              </button>

              {/* Single smooth sliding underline indicator */}
              {tabLine.width > 0 && (
                <motion.div
                  initial={false}
                  animate={{ left: tabLine.left, width: tabLine.width }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-0 h-[2.5px] bg-[#30001A] dark:bg-rose-300 rounded-full"
                />
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="flex flex-col gap-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 dark:text-red-400 text-[11px] luxury-tracking p-3.5 bg-red-500/10 border border-red-500/20 rounded-md font-semibold"
              >
                {error}
              </motion.div>
            )}

            {view === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="uppercase text-[10px] luxury-tracking font-semibold text-zinc-500 dark:text-zinc-400">
                    {lang === 'ar' ? 'الاسم الكامل' : 'FULL NAME'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'ar' ? 'الاسم بالكامل' : 'ENTER YOUR FULL NAME'}
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 px-4 py-3.5 text-xs luxury-tracking text-[#30001A] dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#30001A] dark:focus:border-rose-300 transition-colors rounded-md font-bold"
                    required
                  />
                </div>

                {/* Phone Number with Fixed Egypt Badge */}
                <div className="space-y-1">
                  <label className="uppercase text-[10px] luxury-tracking font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <PhoneIcon size={12} className="text-amber-500" />
                    {lang === 'ar' ? 'رقم الهاتف (رمز مصر ثابت)' : 'PHONE NUMBER (EGYPT)'}
                  </label>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 px-3 py-2 rounded-md">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-200 dark:bg-white/10 rounded font-mono font-bold text-xs text-zinc-800 dark:text-amber-300 shrink-0">
                      <span>🇪🇬</span>
                      <span>+20</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={lang === 'ar' ? 'رقم الهاتف' : 'PHONE NUMBER'}
                      className="w-full bg-transparent text-xs font-mono font-bold text-[#30001A] dark:text-white placeholder-zinc-400 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Governorate Select */}
                <div className="space-y-1">
                  <label className="uppercase text-[10px] luxury-tracking font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <MapPin size={12} className="text-amber-500" />
                    {lang === 'ar' ? 'المحافظة (جميع محافظات مصر)' : 'GOVERNORATE'}
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 px-4 py-3.5 text-xs font-bold text-[#30001A] dark:text-white focus:outline-none focus:border-[#30001A] dark:focus:border-rose-300 transition-colors rounded-md"
                    required
                  >
                    {EGYPT_GOVERNORATES.map((gov, idx) => (
                      <option key={`${gov.id}-${idx}`} value={gov.nameAr} className="bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
                        {lang === 'ar' ? gov.nameAr : `${gov.nameEn} (${gov.nameAr})`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="uppercase text-[10px] luxury-tracking font-semibold text-zinc-500 dark:text-zinc-400">
                {view === 'login' ? (lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS') : (lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS')}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}
                className="w-full bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 px-4 py-3.5 text-xs luxury-tracking text-[#30001A] dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#30001A] dark:focus:border-rose-300 transition-colors rounded-md"
              />
            </div>

            <div className="space-y-1 relative">
              <label className="uppercase text-[10px] luxury-tracking font-semibold text-zinc-500 dark:text-zinc-400">
                {lang === 'ar' ? 'كلمة المرور' : 'PASSWORD'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 px-4 py-3.5 text-xs luxury-tracking text-[#30001A] dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#30001A] dark:focus:border-rose-300 transition-colors rounded-md rtl:pr-4 rtl:pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute rtl:left-3 right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#30001A] text-white dark:bg-white dark:text-[#30001A] py-4 rounded-md text-xs luxury-tracking font-extrabold tracking-[0.25em] hover:bg-[#1b000f] dark:hover:bg-[#f8f1f5] transition-all flex justify-center items-center gap-3 cursor-pointer shadow-xl shadow-[#30001A]/20 group mt-2"
            >
              <span>{view === 'login' ? (lang === 'ar' ? 'تسجيل الدخول' : 'SIGN IN') : (lang === 'ar' ? 'إتمام التسجيل' : 'CREATE ACCOUNT')}</span>
              <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-1.5 rtl:group-hover:-translate-x-1.5 transition-transform" />
            </button>

            </form>
        </motion.div>
      </main>

      {/* Simple Clean Footer */}
      <footer className="w-full py-6 text-center text-[10px] luxury-tracking text-zinc-500 dark:text-zinc-400 font-mono border-t border-black/5 dark:border-white/5">
        &copy; {new Date().getFullYear()} AVENTO7 MENSWEAR. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
