import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRight, Eye, EyeOff, MapPin, Phone as PhoneIcon } from 'lucide-react';
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { User } from '../types';
import { saveUser, db, collection, getDocs } from '../lib/db';
import { EGYPT_GOVERNORATES } from '../constants/governorates';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  lang?: 'en' | 'ar';
}

export default function AuthModal({ isOpen, onClose, onLogin, lang = 'en' }: AuthModalProps) {
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
    if (isOpen) {
      const activeBtn = view === 'login' ? loginTabRef.current : registerTabRef.current;
      if (activeBtn) {
        setTabLine({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
        });
      }
    }
  }, [view, isOpen, lang]);

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

      // Check Admin Credentials
      if (cleanEmail === 'admin' || cleanEmail === 'admin@avento.com') {
        if (password === '1234' || password === 'admin123') {
          const adminUser: User = { id: 'admin-1', name: 'System Admin', email: 'admin@avento.com', role: 'admin' };
          onLogin(adminUser);
          onClose();
          return;
        } else {
          setError(lang === 'ar' ? 'كلمة مرور مدير النظام غير صحيحة.' : 'INCORRECT PASSWORD FOR ADMIN ACCOUNT.');
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
        setError(lang === 'ar' ? 'الحساب غير موجود. يجب عليك إنشاء حساب جديد.' : 'ACCOUNT NOT FOUND. YOU MUST REGISTER FIRST UNDER "REGISTER".');
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
        role: 'user', 
        createdAt: user.createdAt 
      };
      onLogin(loggedUser);
      onClose();
    } else {
      // Registration Logic
      if (!name.trim() || !phone.trim() || !cleanEmail || !password) {
        setError(lang === 'ar' ? 'جميع الحقول مطلوبة.' : 'ALL FIELDS INCLUDING FULL NAME AND PHONE ARE REQUIRED.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setError(lang === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح.' : 'PLEASE ENTER A VALID EMAIL ADDRESS (E.G. USER@GMAIL.COM).');
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
        role: 'user' as const,
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
        role: 'user', 
        createdAt: newUser.createdAt 
      };
      onLogin(loggedUser);
      onClose();
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white text-zinc-900 dark:bg-[#0a0a0a] dark:text-white border border-black/10 dark:border-white/10 p-8 md:p-12 shadow-2xl flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-zinc-500 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
            <h2 className="serif-display text-4xl mb-8 font-light tracking-wider uppercase text-zinc-900 dark:text-[#f5f5f7]">
              {view === 'login' ? (lang === 'ar' ? 'تسجيل الدخول' : 'SIGN IN') : (lang === 'ar' ? 'إنشاء حساب' : 'CREATE ACCOUNT')}
            </h2>

            <div className="flex gap-4 border-b border-black/10 dark:border-white/10 mb-8 text-[10px] luxury-tracking font-medium text-zinc-500 dark:text-white/50 relative">
              <button
                ref={loginTabRef}
                type="button"
                className={`pb-3.5 px-3 font-bold tracking-[0.2em] transition-colors relative cursor-pointer ${view === 'login' ? 'text-[#30001A] dark:text-white' : 'hover:text-black dark:hover:text-white'}`}
                onClick={() => switchView('login')}
              >
                <span>{lang === 'ar' ? 'تسجيل الدخول' : 'LOGIN'}</span>
              </button>
              <button
                ref={registerTabRef}
                type="button"
                className={`pb-3.5 px-3 font-bold tracking-[0.2em] transition-colors relative cursor-pointer ${view === 'register' ? 'text-[#30001A] dark:text-white' : 'hover:text-black dark:hover:text-white'}`}
                onClick={() => switchView('register')}
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

            <form onSubmit={handleAuth} className="flex flex-col gap-6">
              {error && (
                <div className="text-red-500 text-[10px] luxury-tracking uppercase p-3 bg-red-500/10 border border-red-500/20">
                  {error}
                </div>
              )}

              {view === 'register' && (
                <>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={lang === 'ar' ? 'الاسم الكامل' : 'FULL NAME'}
                      className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-4 text-xs luxury-tracking text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white transition-colors uppercase font-medium"
                      required
                    />
                  </div>

                  {/* Phone Input with Fixed Egypt Prefix */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <PhoneIcon size={12} className="text-amber-500" />
                      {lang === 'ar' ? 'رقم الهاتف (مصر)' : 'PHONE NUMBER (EGYPT)'}
                    </label>
                    <div className="flex items-center gap-2 border-b border-black/20 dark:border-white/20 pb-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-white/10 rounded-md font-mono font-bold text-xs text-zinc-800 dark:text-amber-300 shrink-0">
                        <span>🇪🇬</span>
                        <span>+20</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="1012345678"
                        className="w-full bg-transparent text-xs luxury-tracking font-mono font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Governorate Select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <MapPin size={12} className="text-amber-500" />
                      {lang === 'ar' ? 'المحافظة (جميع محافظات مصر)' : 'GOVERNORATE'}
                    </label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border-b border-black/20 dark:border-white/20 pb-2 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none uppercase"
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

              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={view === 'login' ? (lang === 'ar' ? "البريد الإلكتروني أو 'ADMIN'" : "EMAIL OR 'ADMIN'") : (lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS')}
                  className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-4 text-xs luxury-tracking text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white transition-colors uppercase"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={lang === 'ar' ? 'كلمة المرور' : 'PASSWORD'}
                  className="w-full bg-transparent border-b border-black/20 dark:border-white/20 pb-4 text-xs luxury-tracking text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white transition-colors uppercase rtl:pr-0 rtl:pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute rtl:right-auto rtl:left-0 right-0 bottom-4 text-zinc-500 hover:text-black dark:text-white/50 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <button
                  type="submit"
                  className="w-full bg-[#30001A] text-white dark:bg-white dark:text-[#30001A] py-4 text-[10px] luxury-tracking font-bold uppercase tracking-[0.2em] hover:bg-[#1b000f] dark:hover:bg-[#f8f1f5] transition-colors flex justify-center items-center gap-4 group cursor-pointer shadow-lg shadow-[#30001A]/20"
                >
                  {view === 'login' ? (lang === 'ar' ? 'تسجيل الدخول' : 'SIGN IN') : (lang === 'ar' ? 'تسجيل' : 'REGISTER')}
                  <ArrowRight size={16} className="rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </button>
                
                {view === 'login' && (
                  <div className="flex flex-col items-center gap-2.5 mt-2">
                    <button type="button" className="text-[10px] luxury-tracking text-zinc-500 dark:text-[#86868b] hover:text-black dark:hover:text-white transition-colors uppercase text-center">
                      {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'FORGOT PASSWORD?'}
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('ahmed@gmail.com');
                          setPassword('password123');
                        }}
                        className="text-[9px] luxury-tracking font-mono text-zinc-700 dark:text-zinc-300 hover:underline uppercase bg-zinc-100 dark:bg-white/10 px-2.5 py-1 border border-black/10 dark:border-white/10"
                      >
                        DEMO CLIENT: ahmed@gmail.com / password123
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin');
                          setPassword('1234');
                        }}
                        className="text-[9px] luxury-tracking font-mono text-amber-600 dark:text-amber-400 hover:underline uppercase bg-amber-500/10 px-2.5 py-1 border border-amber-500/20"
                      >
                        DEMO ADMIN: admin / 1234
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
