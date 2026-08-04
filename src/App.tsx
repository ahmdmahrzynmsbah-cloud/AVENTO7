/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftRight, ShieldCheck } from 'lucide-react';
import Preloader from './components/Preloader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collection from './components/Collection';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CompareDrawer from './components/CompareDrawer';
import ProductModal from './components/ProductModal';
import AuthModal from './components/AuthModal';
import AuthPage from './components/AuthPage';
import MobileMenu from './components/MobileMenu';
import AdminPanel from './components/AdminPanel';
import CustomerDashboard from './components/CustomerDashboard';
import TopMarquee from './components/TopMarquee';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ScrollProgress from './components/ScrollProgress';
import ProductComparisonModal from './components/ProductComparisonModal';
import { Product, CartItem, User, StoreSettings, Order } from './types';
import { 
  subscribeProducts, 
  subscribeOrders, 
  subscribeSettings, 
  saveProduct, 
  deleteProduct, 
  saveSettings,
  saveUser,
  defaultSettings
} from './lib/db';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('unknown_theme') as 'light' | 'dark') || 'light';
  });

  const [lang] = useState<'en' | 'ar'>('en');

  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('unknown_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [comparedProducts, setComparedProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('avento7_compared_products');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(prev => prev === message ? null : prev);
    }, 3000);
  };
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'store' | 'admin' | 'customer' | 'auth'>('store');
  const [customerTab, setCustomerTab] = useState<'overview' | 'orders' | 'profile' | 'addresses'>('orders');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings);

  const handleOpenTrackOrder = () => {
    setCustomerTab('orders');
    setViewMode('customer');
  };
  
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('unknown_lang', 'en');
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('unknown_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    // Subscribe to Firestore Realtime Data
    const unsubscribeProd = subscribeProducts((prods) => {
      setProductsList(prods);
    });

    const unsubscribeOrd = subscribeOrders((ords) => {
      setOrdersList(ords);
    });

    const unsubscribeSet = subscribeSettings((sets) => {
      setStoreSettings(sets);
    });

    // Check local storage for active session
    const activeSession = localStorage.getItem('unknown_session');
    if (activeSession) {
      try {
        const userObj = JSON.parse(activeSession);
        setCurrentUser(userObj);
        if (userObj.role === 'admin') {
          setViewMode('admin');
        }
      } catch (e) {
        localStorage.removeItem('unknown_session');
      }
    }

    return () => {
      unsubscribeProd();
      unsubscribeOrd();
      unsubscribeSet();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('unknown_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem('avento7_compared_products', JSON.stringify(comparedProducts));
  }, [comparedProducts]);

  const handleToggleWishlist = (productId: string) => {
    if (currentUser?.role === 'admin') {
      showToast(lang === 'ar' 
        ? 'حساب المسؤول لإدارة المتجر فقط ولا يمكنه استخدام قائمة المفضلة.' 
        : 'Admin accounts cannot use Wishlist as a customer.'
      );
      setViewMode('admin');
      return;
    }
    setWishlistIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleToggleCompare = (product: Product) => {
    if (currentUser?.role === 'admin') {
      showToast(lang === 'ar' 
        ? 'حساب المسؤول لإدارة المتجر فقط ولا يمكنه مقارنة المنتجات.' 
        : 'Admin accounts cannot compare products.'
      );
      setViewMode('admin');
      return;
    }
    setComparedProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast(lang === 'ar' ? 'تم إزالة المنتج من المقارنة' : 'Product removed from Compare');
        return prev.filter(p => p.id !== product.id);
      }
      if (prev.length >= 4) {
        showToast(lang === 'ar' ? 'الحد الأقصى للمقارنة هو 4 منتجات' : 'Maximum 4 products allowed for comparison');
        return prev;
      }
      const nextList = [...prev, product];
      showToast(lang === 'ar' 
        ? `تمت إضافة المنتج للمقارنة (${nextList.length}/4)` 
        : `Product added to Compare (${nextList.length}/4)`
      );
      return nextList;
    });
  };

  const handleRemoveCompare = (productId: string) => {
    setComparedProducts(prev => {
      const nextList = prev.filter(p => p.id !== productId);
      showToast(lang === 'ar' ? 'تم إزالة المنتج من المقارنة' : 'Product removed from Compare');
      return nextList;
    });
  };

  const handleClearCompare = () => {
    setComparedProducts([]);
    showToast(lang === 'ar' ? 'تمت إزالة جميع المنتجات من المقارنة' : 'Compare list cleared');
  };

  const handleSelectCompareProduct = (product: Product) => {
    if (currentUser?.role === 'admin') {
      showToast(lang === 'ar' ? 'حساب المسؤول لإدارة المتجر فقط.' : 'Admin accounts cannot compare products.');
      setViewMode('admin');
      return;
    }
    setComparedProducts(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      if (prev.length >= 4) {
        showToast(lang === 'ar' ? 'الحد الأقصى للمقارنة هو 4 منتجات' : 'Maximum 4 products allowed for comparison');
        return prev;
      }
      const nextList = [...prev, product];
      showToast(lang === 'ar' 
        ? `تمت إضافة المنتج للمقارنة (${nextList.length}/4)` 
        : `Product added to Compare (${nextList.length}/4)`
      );
      return nextList;
    });
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    localStorage.setItem('unknown_session', JSON.stringify(user));
    if (user.role === 'admin') {
      setViewMode('admin');
    } else {
      setViewMode('customer');
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('unknown_session', JSON.stringify(updatedUser));
    saveUser(updatedUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setViewMode('store');
    localStorage.removeItem('unknown_session');
  };

  const handleAddProduct = (product: Product) => {
    saveProduct(product);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    saveProduct(updatedProduct);
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleAddToCart = (product: Product, size: string, quantity: number) => {
    if (currentUser?.role === 'admin') {
      showToast(lang === 'ar' 
        ? 'حساب المسؤول لإدارة المتجر فقط ولا يمكنه إضافة منتجات للسلة أو الشراء.' 
        : 'Admin accounts cannot add items to cart or place orders.'
      );
      setViewMode('admin');
      return;
    }
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.size === size 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, size, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Prevent scrolling while UI overlays are active
  useEffect(() => {
    if (isLoading || isCartOpen || isWishlistOpen || isCompareDrawerOpen || isTrackOrderOpen || isModalOpen || isAuthOpen || isMobileMenuOpen || isCompareModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLoading, isCartOpen, isWishlistOpen, isCompareDrawerOpen, isTrackOrderOpen, isModalOpen, isAuthOpen, isMobileMenuOpen, isCompareModalOpen]);

  const wishlistedProducts = productsList.filter(p => wishlistIds.includes(p.id));

  return (
    <>
      <Preloader onComplete={() => setIsLoading(false)} lang={lang} />
      
      <div className="min-h-screen bg-[#fcfcfc] text-[#0a0a0a] dark:bg-[#050505] dark:text-[#f5f5f7] flex flex-col font-sans overflow-x-clip transition-colors duration-500">
        {/* Persistent Admin Storefront Preview Sticky Banner */}
        {currentUser?.role === 'admin' && viewMode === 'store' && (
          <div className="sticky top-0 z-[100] w-full bg-amber-500 text-zinc-950 px-4 py-2.5 text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg border-b border-amber-600">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <ShieldCheck size={18} className="shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'معاينة المتجر (حساب مسؤول) — إجراءات الشراء، السلة والدفع معطلة تماماً للحساب الإداري.'
                  : 'STOREFRONT PREVIEW (ADMIN) — Purchasing, Cart, and Checkout actions are strictly disabled for admin accounts.'}
              </span>
            </div>
            <button
              onClick={() => setViewMode('admin')}
              className="px-3.5 py-1.5 bg-zinc-950 text-amber-400 font-extrabold text-[11px] uppercase rounded-lg hover:bg-zinc-800 transition-all shadow-md cursor-pointer shrink-0"
            >
              {lang === 'ar' ? 'العودة للوحة التحكم' : 'RETURN TO ADMIN PANEL'}
            </button>
          </div>
        )}

        {viewMode === 'store' && (
          <Navbar 
            theme={theme}
            onToggleTheme={toggleTheme}
            lang={lang}
            cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
            onOpenCart={() => {
              if (currentUser?.role === 'admin') {
                setViewMode('admin');
              } else {
                setIsCartOpen(true);
              }
            }} 
            wishlistCount={wishlistIds.length}
            onOpenWishlist={() => {
              if (currentUser?.role === 'admin') {
                setViewMode('admin');
              } else {
                setIsWishlistOpen(true);
              }
            }}
            onOpenCompare={() => {
              if (currentUser?.role === 'admin') {
                setViewMode('admin');
              } else {
                setIsCompareDrawerOpen(true);
              }
            }}
            compareCount={comparedProducts.length}
            onOpenTrackOrder={handleOpenTrackOrder}
            onOpenAuth={() => setViewMode('auth')}
            onOpenMenu={() => setIsMobileMenuOpen(true)}
            user={currentUser}
            onLogout={handleLogout}
            onViewAdmin={() => setViewMode('admin')}
            onOpenCustomerDashboard={() => {
              if (currentUser?.role === 'admin') {
                setViewMode('admin');
              } else {
                setCustomerTab('overview');
                setViewMode('customer');
              }
            }}
          />
        )}
        
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          user={currentUser}
          onOpenAuth={() => setViewMode('auth')}
          onLogout={handleLogout}
          onViewAdmin={() => setViewMode('admin')}
          onOpenCustomerDashboard={() => {
            if (currentUser?.role === 'admin') {
              setViewMode('admin');
            } else {
              setCustomerTab('overview');
              setViewMode('customer');
            }
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
          lang={lang}
        />

        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cartItems={cartItems}
          setCartItems={setCartItems}
          currentUser={currentUser}
          storeSettings={storeSettings}
          onViewAdmin={() => setViewMode('admin')}
          lang={lang}
        />

        <WishlistDrawer
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistItems={wishlistedProducts}
          onRemoveFromWishlist={handleToggleWishlist}
          onAddToCart={(product, size) => handleAddToCart(product, size || 'M', 1)}
          currentUser={currentUser}
          onViewAdmin={() => setViewMode('admin')}
          lang={lang}
        />

        <CompareDrawer
          isOpen={isCompareDrawerOpen}
          onClose={() => setIsCompareDrawerOpen(false)}
          comparedProducts={comparedProducts}
          onRemoveProduct={handleRemoveCompare}
          onClearAll={handleClearCompare}
          onOpenCompareModal={() => {
            if (currentUser?.role === 'admin') {
              setViewMode('admin');
            } else {
              setIsCompareDrawerOpen(false);
              setIsCompareModalOpen(true);
            }
          }}
          onAddToCart={(product, size) => handleAddToCart(product, size || 'M', 1)}
          onViewProduct={handleViewProduct}
          currentUser={currentUser}
          onViewAdmin={() => setViewMode('admin')}
          lang={lang}
        />

        <ProductModal 
          product={selectedProduct} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAddToCart={handleAddToCart}
          onUpdateProduct={handleUpdateProduct}
          isCompared={selectedProduct ? comparedProducts.some(p => p.id === selectedProduct.id) : false}
          onToggleCompare={handleToggleCompare}
          currentUserContact={currentUser?.email || currentUser?.phone || ''}
          currentUserId={currentUser?.id || ''}
          currentUser={currentUser}
          onViewAdmin={() => setViewMode('admin')}
          lang={lang}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLogin}
          lang={lang}
        />

        <ProductComparisonModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          comparedProducts={comparedProducts}
          allProducts={productsList}
          onRemoveProduct={handleRemoveCompare}
          onAddProduct={handleSelectCompareProduct}
          onClearAll={handleClearCompare}
          onAddToCart={(product, size) => handleAddToCart(product, size || 'M', 1)}
          onViewProduct={handleViewProduct}
          currentUser={currentUser}
          onViewAdmin={() => setViewMode('admin')}
          lang={lang}
        />

        {/* Toast Notification for Compare actions */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-6 right-6 z-[100] px-4 py-3 rounded-2xl bg-zinc-900/95 text-white dark:bg-white/95 dark:text-zinc-950 text-xs font-medium shadow-2xl backdrop-blur-md flex items-center gap-3 border border-white/15 dark:border-black/15 pointer-events-none"
            >
              <div className="w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-bold shrink-0">
                <ArrowLeftRight size={14} />
              </div>
              <span className="tracking-wide font-sans">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        <main className="flex-1 w-full flex flex-col">
          {viewMode === 'auth' ? (
            <AuthPage
              onLogin={handleLogin}
              onBackToStore={() => setViewMode('store')}
              theme={theme}
              onToggleTheme={toggleTheme}
              lang={lang}
            />
          ) : viewMode === 'store' ? (
            <>
              <Hero images={storeSettings.heroImages} lang={lang} />
              <TopMarquee offers={storeSettings.offers} lang={lang} />
              <div className="w-full flex justify-center py-12 md:py-20">
                <div className="w-full max-w-[1400px] px-6 md:px-12">
                  <Collection 
                    products={productsList} 
                    onViewProduct={handleViewProduct} 
                    wishlistIds={wishlistIds}
                    onToggleWishlist={handleToggleWishlist}
                    comparedIds={comparedProducts.map(p => p.id)}
                    onToggleCompare={handleToggleCompare}
                    currentUser={currentUser}
                    onViewAdmin={() => setViewMode('admin')}
                    lang={lang}
                  />
                </div>
              </div>
            </>
          ) : viewMode === 'admin' ? (
            <AdminPanel 
              products={productsList}
              settings={storeSettings}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateSettings={handleUpdateSettings}
              onBackToStore={() => setViewMode('store')}
              currentUser={currentUser}
              onUpdateCurrentUser={setCurrentUser}
              lang={lang}
            />
          ) : (
            <CustomerDashboard
              user={currentUser}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              onBackToStore={() => setViewMode('store')}
              onViewAdmin={() => setViewMode('admin')}
              onOpenAuth={() => setViewMode('auth')}
              theme={theme}
              onToggleTheme={toggleTheme}
              lang={lang}
              initialTab={customerTab}
            />
          )}
        </main>
        
        {viewMode === 'store' && (
          <>
            <Footer 
              onOpenTrackOrder={handleOpenTrackOrder} 
              socialLinks={storeSettings.socialLinks}
              lang={lang}
            />
            <FloatingWhatsApp lang={lang} />
            <ScrollProgress />
          </>
        )}
      </div>
    </>
  );
}
