import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Product, StoreSettings, User, Order, RestockNotification } from '../types';
import { EGYPT_GOVERNORATES, getDefaultShippingRates } from '../constants/governorates';
import { 
  subscribeUsers, subscribeOrders, saveUser, deleteUser, saveOrder, deleteOrder,
  subscribeNotifications, triggerNotificationsForProduct, triggerRestockNotificationsForProduct, deleteNotification, deleteRestockNotification,
  subscribeAdminNotifications, markNotificationAsRead, markAllNotificationsAsRead 
} from '../lib/db';
import { requestNotificationPermission, listenToForegroundMessages } from '../lib/fcm';
import { audioPlayer } from "../lib/audioPlayer";
import { 
  Plus, Trash2, Package, DollarSign, Users, ShoppingBag, ArrowLeft, Edit2, X, 
  Phone, Mail, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, TrendingUp, 
  BarChart2, PieChart, Percent, Award, ShieldAlert, Ban, Search, ArrowUpDown, Sparkles, Zap, Truck, Check,
  Upload, Image as ImageIcon, Link, MessageCircle, Tag, Ticket, RefreshCw, Facebook, Instagram, Share2,
  Archive, UserX, UserCheck, Eye, Copy, Filter, SlidersHorizontal, Layers, Boxes, ChevronDown, CheckSquare, Square,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, Menu, Bell, Star, Settings, LogOut, LayoutDashboard, Globe,
  ThumbsUp, MessageSquare
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  settings: StoreSettings;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onBackToStore: () => void;
  onLogout?: () => void;
  currentUser?: User | null;
  onUpdateCurrentUser?: (user: User) => void;
  lang?: 'en' | 'ar';
}

function TikTokIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.65 6.34 6.34 0 0 0 9.35 22a6.3 6.3 0 0 0 6.27-6.23V9.16a9 9 0 0 0 5.08 1.56V7.27a6.29 6.29 0 0 1-1.11-.58z"/>
    </svg>
  );
}

export default function AdminPanel({ 
  products, 
  settings, 
  onAddProduct, 
  onUpdateProduct, 
  onDeleteProduct, 
  onUpdateSettings, 
  onBackToStore,
  onLogout,
  currentUser,
  onUpdateCurrentUser,
  lang = 'en'
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'orders' | 'users' | 'products' | 'storefront' | 'shipping' | 'coupons' | 'notifications' | 'admin-alerts' | 'reviews' | 'settings'>('overview');
  const [userFilter, setUserFilter] = useState<'active' | 'archived'>('active');
  const [userSearch, setUserSearch] = useState('');
  
  // Real Data State loaded from Firestore
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notificationsList, setNotificationsList] = useState<RestockNotification[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<import('../types').AdminNotification[]>([]);
  const [notifFilter, setNotifFilter] = useState<'all' | 'pending' | 'notified'>('all');

  const [notifSearch, setNotifSearch] = useState('');
  const [restockAlertToast, setRestockAlertToast] = useState<{ productName: string; count: number } | null>(null);

  // Safe date formatter function to prevent RTL number inversions
  const formatDateSafely = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
    } catch {
      return dateStr;
    }
  };

  // Coupons State & Auto Generator
  const generateRandomCouponCode = () => {
    const prefixes = ['AVENTO', 'SALE', 'PROMO', 'OFFER', 'VIP', 'FOX', 'DEAL'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${randomStr}${randomNum}`;
  };

  const [newCouponCode, setNewCouponCode] = useState(() => generateRandomCouponCode());
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(0);
  const [newCouponScope, setNewCouponScope] = useState<'all' | 'product' | 'category'>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categoriesList = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const handleAddCoupon = () => {
    if (!newCouponCode.trim() || newCouponValue <= 0) return;
    const selectedProd = products.find(p => p.id === selectedProductId);
    const newC = {
      id: `coupon-${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: newCouponValue,
      minOrderAmount: newCouponMinOrder || undefined,
      active: true,
      applicableProductId: newCouponScope === 'product' ? selectedProductId : undefined,
      applicableProductName: newCouponScope === 'product' ? selectedProd?.name : undefined,
      applicableCategory: newCouponScope === 'category' ? selectedCategory : undefined,
    };
    const updatedCoupons = [...(settings.coupons || []), newC];
    onUpdateSettings({ ...settings, coupons: updatedCoupons });
    setNewCouponCode(generateRandomCouponCode());
    setNewCouponValue(10);
    setNewCouponMinOrder(0);
    setNewCouponScope('all');
    setSelectedProductId('');
    setSelectedCategory('');
  };

  const handleToggleCouponStatus = (couponId: string) => {
    const updatedCoupons = (settings.coupons || []).map(c => 
      c.id === couponId ? { ...c, active: !c.active } : c
    );
    onUpdateSettings({ ...settings, coupons: updatedCoupons });
  };

  const handleDeleteCoupon = (couponId: string) => {
    const updatedCoupons = (settings.coupons || []).filter(c => c.id !== couponId);
    onUpdateSettings({ ...settings, coupons: updatedCoupons });
  };

  // Shipping Rates State
  const [shippingRatesMap, setShippingRatesMap] = useState<Record<string, number>>(() => {
    return settings.shippingRates || getDefaultShippingRates();
  });
  const [shippingSearch, setShippingSearch] = useState('');
  const [bulkRateValue, setBulkRateValue] = useState('');
  const [shippingSavedSuccess, setShippingSavedSuccess] = useState(false);

  // Social Links State
  const [facebookUrl, setFacebookUrl] = useState(settings.socialLinks?.facebook || '');
  const [instagramUrl, setInstagramUrl] = useState(settings.socialLinks?.instagram || '');
  const [tiktokUrl, setTiktokUrl] = useState(settings.socialLinks?.tiktok || '');
  const [telegramBotToken, setTelegramBotToken] = useState(settings.telegramBotToken || '');
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId || '');
  const [socialSavedSuccess, setSocialSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings.socialLinks) {
      setFacebookUrl(settings.socialLinks.facebook || '');
      setInstagramUrl(settings.socialLinks.instagram || '');
      setTiktokUrl(settings.socialLinks.tiktok || '');
    }
  }, [settings]);

  const handleSaveSocialLinks = () => {
    onUpdateSettings({
      ...settings,
      socialLinks: {
        facebook: facebookUrl.trim(),
        instagram: instagramUrl.trim(),
        tiktok: tiktokUrl.trim()
      }
    });
    setSocialSavedSuccess(true);
    setTimeout(() => setSocialSavedSuccess(false), 3000);
  };

  // Reviews State
  interface ReviewItem {
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    userName: string;
    userEmail: string;
    rating: number;
    comment: string;
    createdAt: string;
    status: 'approved' | 'pending';
    isFeatured?: boolean;
    reply?: string;
  }

  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(() => [
    {
      id: 'rev-1',
      productId: products[0]?.id || 'p-1',
      productName: products[0]?.name || 'Oversized Heavyweight Hoodie',
      productImage: products[0]?.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      userName: 'Ahmed Mansour',
      userEmail: 'ahmed.m@example.com',
      rating: 5,
      comment: 'جودة القماش ممتازة جداً والخامة ثقيلة مناسبة للشتاء. الشحن كان سريع وسلس والتغليف فخم.',
      createdAt: '2026-08-01',
      status: 'approved',
      isFeatured: true,
      reply: 'شكراً لك أحمد! يسعدنا جداً أن المنتج نال إعجابك 🙏'
    },
    {
      id: 'rev-2',
      productId: products[1]?.id || 'p-2',
      productName: products[1]?.name || 'Relaxed Cargo Pants',
      productImage: products[1]?.image || 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&q=80&w=800',
      userName: 'Kareem Zaki',
      userEmail: 'kareem.z@example.com',
      rating: 4,
      comment: 'البنطلون مريح جدا في اللبس والقصة مظبوطة بالظبط. يستحق السعر بجد.',
      createdAt: '2026-08-02',
      status: 'approved',
    },
    {
      id: 'rev-3',
      productId: products[2]?.id || 'p-3',
      productName: products[2]?.name || 'Vintage Acid Wash Tee',
      productImage: products[2]?.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800',
      userName: 'Omar Sherif',
      userEmail: 'omar.s@example.com',
      rating: 5,
      comment: 'اللون والتطريز تحفة الحقيقة. أتمنى توفر ألوان تانية قريباً!',
      createdAt: '2026-08-03',
      status: 'pending',
    },
    {
      id: 'rev-4',
      productId: products[0]?.id || 'p-1',
      productName: products[0]?.name || 'Oversized Heavyweight Hoodie',
      productImage: products[0]?.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
      userName: 'Youssef Hassan',
      userEmail: 'youssef.h@example.com',
      rating: 5,
      comment: 'خامة محترمة جدا وسعر أوريجينال مقارنة بالبراندات العالمية.',
      createdAt: '2026-08-04',
      status: 'approved',
    }
  ]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');
  const [reviewReplyInput, setReviewReplyInput] = useState<Record<string, string>>({});

  const handleToggleReviewStatus = (id: string) => {
    setReviewsList(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'approved' ? 'pending' : 'approved' } : r));
  };

  const handleDeleteReview = (id: string) => {
    setReviewsList(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleFeaturedReview = (id: string) => {
    setReviewsList(prev => prev.map(r => r.id === id ? { ...r, isFeatured: !r.isFeatured } : r));
  };

  const handleSaveReviewReply = (id: string) => {
    const replyText = reviewReplyInput[id]?.trim();
    if (!replyText) return;
    setReviewsList(prev => prev.map(r => r.id === id ? { ...r, reply: replyText } : r));
    setReviewReplyInput(prev => ({ ...prev, [id]: '' }));
  };

  // General Settings State
  const [storeName, setStoreName] = useState(settings.storeName || 'A7 BRAND STORE');
  const [contactEmail, setContactEmail] = useState(settings.supportEmail || 'support@a7clothing.com');
  const [contactPhone, setContactPhone] = useState(settings.supportPhone || '+20 100 123 4567');
  const [storeCurrency, setStoreCurrency] = useState(settings.currency || 'EGP');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(settings.freeShippingThreshold || 3000);
  const [marqueeText, setMarqueeText] = useState(settings.marqueeText || 'توصيل سريع لكافة محافظات مصر • الدفع عند الاستلام متاح');
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Notification Settings State
  const defaultNotifSettings: import('../types').AdminNotificationSettings = {
    soundUrl: '/sounds/shopify.wav',
    volume: 'Medium',
    isMuted: false,
    vibrate: true,
    soundsByType: {
      newOrder: '/sounds/shopify.wav',
      paymentConfirmed: '/sounds/stripe.wav',
      orderShipped: '/sounds/linear.wav',
      orderCancelled: '/sounds/apple.wav',
      lowStock: '/sounds/soft_bell.wav',
      newCustomer: '/sounds/premium_ding.wav',
    }
  };
  
  const [notifSettings, setNotifSettings] = useState<import('../types').AdminNotificationSettings>(
    currentUser?.notificationSettings || defaultNotifSettings
  );
  const notifSettingsRef = React.useRef(notifSettings);
  React.useEffect(() => {
    notifSettingsRef.current = notifSettings;
  }, [notifSettings]);

  const handleSaveGeneralSettings = async () => {
    onUpdateSettings({
      ...settings,
      storeName: storeName.trim(),
      supportEmail: contactEmail.trim(),
      supportPhone: contactPhone.trim(),
      currency: storeCurrency.trim(),
      freeShippingThreshold,
      marqueeText: marqueeText.trim(),
      socialLinks: {
        facebook: facebookUrl.trim(),
        instagram: instagramUrl.trim(),
        tiktok: tiktokUrl.trim()
      }
    });
    if (currentUser && onUpdateCurrentUser) {
      try {
        const updatedUser = { ...currentUser, notificationSettings: notifSettings };
        await saveUser(updatedUser);
        onUpdateCurrentUser(updatedUser);
      } catch (e) {
        console.error('Failed to save notification settings', e);
      }
    }

    setSettingsSavedSuccess(true);
    setTimeout(() => setSettingsSavedSuccess(false), 3000);
  };

  useEffect(() => {
    if (settings.shippingRates) {
      setShippingRatesMap(settings.shippingRates);
    }
  }, [settings]);

  const handleRateChange = (govNameAr: string, newRate: number) => {
    setShippingRatesMap(prev => ({
      ...prev,
      [govNameAr]: Math.max(0, newRate)
    }));
  };

  const handleApplyBulkRate = () => {
    const parsed = Number(bulkRateValue);
    if (isNaN(parsed) || parsed < 0) return;
    const updated: Record<string, number> = {};
    EGYPT_GOVERNORATES.forEach(gov => {
      updated[gov.nameAr] = parsed;
    });
    setShippingRatesMap(updated);
    setBulkRateValue('');
  };

  const handleResetDefaultShippingRates = () => {
    setShippingRatesMap(getDefaultShippingRates());
  };

  const handleSaveShippingRates = () => {
    onUpdateSettings({
      ...settings,
      shippingRates: shippingRatesMap
    });
    setShippingSavedSuccess(true);
    setTimeout(() => setShippingSavedSuccess(false), 3000);
  };

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'order' | 'user' | 'offer' | 'image';
    idOrIndex: string | number;
    name: string;
  } | null>(null);

  // Telegram Polling for Inline Buttons
  useEffect(() => {
    if (!settings?.telegramBotToken) return;
    
    let isPolling = true;
    let offset = 0;
    
    const poll = async () => {
      while (isPolling) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/getUpdates?offset=${offset}&timeout=30`);
          if (!res.ok) throw new Error("Network response was not ok");
          const data = await res.json();
          
          if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
              offset = update.update_id + 1;
              if (update.callback_query) {
                const cb = update.callback_query;
                const actionData = cb.data; // confirm_ORD-... or cancel_ORD-...
                
                if (actionData.startsWith('confirm_') || actionData.startsWith('cancel_')) {
                  const action = actionData.split('_')[0];
                  const orderId = actionData.split('_')[1];
                  const newStatus = action === 'confirm' ? 'Confirmed' : 'Cancelled';
                  const alertText = action === 'confirm' ? 'تم تأكيد الطلب بنجاح ✅' : 'تم إلغاء الطلب ❌';
                  
                  // Update Firestore
                  import('../lib/db').then(({ updateOrderStatus }) => {
                    updateOrderStatus(orderId, newStatus).then(() => {
                      // Answer callback query
                      fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/answerCallbackQuery`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          callback_query_id: cb.id,
                          text: alertText,
                          show_alert: true
                        })
                      }).catch(e => console.warn(e));
                      
                      // Optionally update message to remove buttons
                      fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/editMessageReplyMarkup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          chat_id: cb.message.chat.id,
                          message_id: cb.message.message_id,
                          reply_markup: {
                            inline_keyboard: [
                              [
                                { text: "🖨️ طباعة الفاتورة", url: `${window.location.origin.replace("ais-dev-", "ais-pre-")}/?print_order=${orderId}` }
                              ]
                            ]
                          }
                        })
                      }).catch(e => console.warn(e));
                    });
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn("Telegram polling error:", e.message);
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    };
    
    poll();
    
    return () => {
      isPolling = false;
    };
  }, [settings?.telegramBotToken]);

  // Load Real Data from Firestore in Realtime
  useEffect(() => {
    if (currentUser?.id) {
      requestNotificationPermission(currentUser.id);
    }
    
    const unsubFCM = listenToForegroundMessages((payload) => {
      const currentNotifSettings = notifSettingsRef.current;
      if (!currentNotifSettings.isMuted) {
        let soundUrl = currentNotifSettings.soundUrl;
        const type = payload.data?.type;
        if (type === 'NEW_ORDER') soundUrl = currentNotifSettings.soundsByType.newOrder || soundUrl;
        else if (type === 'PAYMENT_CONFIRMED') soundUrl = currentNotifSettings.soundsByType.paymentConfirmed || soundUrl;
        else if (type === 'ORDER_CANCELLED') soundUrl = currentNotifSettings.soundsByType.orderCancelled || soundUrl;
        else if (type === 'LOW_STOCK') soundUrl = currentNotifSettings.soundsByType.lowStock || soundUrl;
        else if (type === 'NEW_CUSTOMER') soundUrl = currentNotifSettings.soundsByType.newCustomer || soundUrl;
        
        audioPlayer.play(soundUrl, currentNotifSettings.volume);
      }
      
      if (currentNotifSettings.vibrate && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    });

    const unsubUsers = subscribeUsers((users) => {
      setRegisteredUsers(users);
    });

    const unsubOrders = subscribeOrders((ords) => {
      setOrders(ords);
    });

    const unsubNotifs = subscribeNotifications((notifs) => {
      setNotificationsList(notifs);
    });
    
    const unsubAdminNotifs = subscribeAdminNotifications(
      (notifs) => setAdminNotifications(notifs),
      (newNotif) => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(newNotif.title, { body: newNotif.body });
        }
        const currentNotifSettings = notifSettingsRef.current;
        if (!currentNotifSettings.isMuted) {
          let soundUrl = currentNotifSettings.soundUrl;
          const type = newNotif.type;
          if (type === 'NEW_ORDER') soundUrl = currentNotifSettings.soundsByType.newOrder || soundUrl;
          else if (type === 'PAYMENT_CONFIRMED') soundUrl = currentNotifSettings.soundsByType.paymentConfirmed || soundUrl;
          else if (type === 'ORDER_CANCELLED') soundUrl = currentNotifSettings.soundsByType.orderCancelled || soundUrl;
          else if (type === 'LOW_STOCK') soundUrl = currentNotifSettings.soundsByType.lowStock || soundUrl;
          else if (type === 'NEW_CUSTOMER') soundUrl = currentNotifSettings.soundsByType.newCustomer || soundUrl;
          
          audioPlayer.play(soundUrl, currentNotifSettings.volume);
        }
        
        if (currentNotifSettings.vibrate && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    );

    return () => {
      unsubUsers();
      unsubOrders();
      unsubNotifs();
      unsubAdminNotifs();
      unsubFCM();
    };
  }, [currentUser?.id]);

  const filteredNotifs = notificationsList.filter(n => {
    const queryStr = notifSearch.trim().toLowerCase();
    const matchesSearch = !queryStr || 
      (n.productName && n.productName.toLowerCase().includes(queryStr)) ||
      (n.userEmail && n.userEmail.toLowerCase().includes(queryStr)) ||
      (n.userPhone && n.userPhone.toLowerCase().includes(queryStr)) ||
      (n.userId && n.userId.toLowerCase().includes(queryStr));
    
    if (notifFilter === 'pending') return matchesSearch && !n.notified;
    if (notifFilter === 'notified') return matchesSearch && n.notified;
    return matchesSearch;
  });

  // Update order status in Firestore & localStorage
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const targetOrder = orders.find(ord => ord.id === orderId);
    if (targetOrder) {
      const updated = { ...targetOrder, status: newStatus };
      saveOrder(updated);
    }
  };

  const handleToggleUserArchive = (userId: string) => {
    const targetUser = registeredUsers.find(u => u.id === userId);
    if (targetUser) {
      const updated = { ...targetUser, isArchived: !targetUser.isArchived };
      saveUser(updated);
    }
  };

  // Execution of Delete after Modal Confirmation
  const executeConfirmedDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'product') {
      onDeleteProduct(deleteTarget.idOrIndex as string);
    } else if (deleteTarget.type === 'order') {
      deleteOrder(deleteTarget.idOrIndex as string);
    } else if (deleteTarget.type === 'user') {
      deleteUser(deleteTarget.idOrIndex as string);
    } else if (deleteTarget.type === 'offer') {
      const updated = [...settings.offers];
      updated.splice(deleteTarget.idOrIndex as number, 1);
      onUpdateSettings({ ...settings, offers: updated });
    } else if (deleteTarget.type === 'image') {
      const updated = [...settings.heroImages];
      updated.splice(deleteTarget.idOrIndex as number, 1);
      onUpdateSettings({ ...settings, heroImages: updated });
    }

    setDeleteTarget(null);
  };

  const handleArchiveUser = (id: string) => {
    const targetUser = registeredUsers.find(u => u.id === id);
    if (targetUser) {
      saveUser({ ...targetUser, isArchived: true });
    }
  };

  const handleUnarchiveUser = (id: string) => {
    const targetUser = registeredUsers.find(u => u.id === id);
    if (targetUser) {
      saveUser({ ...targetUser, isArchived: false });
    }
  };

  const [usersFilter, setUsersFilter] = useState<'active' | 'archived'>('active');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Product Form & Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [productStatusFilter, setProductStatusFilter] = useState<string>('ALL');
  const [productSort, setProductSort] = useState<'newest' | 'price-high' | 'price-low' | 'profit-high' | 'stock-low' | 'name-asc'>('newest');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [category, setCategory] = useState("TOPS");
  const [gender, setGender] = useState<"Men" | "Women" | "Unisex">('Unisex');
  const [isNew, setIsNew] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [skuInput, setSkuInput] = useState('');
  const [stockInput, setStockInput] = useState('24');
  const [visibilityInput, setVisibilityInput] = useState<'Published' | 'Draft'>('Published');
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [sizesInput, setSizesInput] = useState<string[]>(['S', 'M', 'L', 'XL']);

  // Profit Table Search & Sorting State
  const [profitSearch, setProfitSearch] = useState('');
  const [profitSort, setProfitSort] = useState<'profit' | 'qty' | 'margin' | 'price' | 'cost'>('profit');

  // Calculate Real Dynamic KPIs
  const nonCancelledOrders = orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'Cancelled');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'Confirmed');
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const processingOrders = orders.filter(o => o.status === 'PROCESSING');
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED' || o.status === 'Cancelled');

  const totalRevenue = nonCancelledOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const activeOrdersCount = pendingOrders.length + processingOrders.length;
  const totalCustomersCount = registeredUsers.length;
  const totalProductsCount = products.length;

  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const completionRate = orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0;

  // --- AUTOMATED PROFIT & FINANCIAL CALCULATIONS ---
  // Map sales by item name/ID across valid orders
  const itemSalesMap: Record<string, { qty: number; revenue: number }> = {};
  nonCancelledOrders.forEach(order => {
    order.items.forEach(item => {
      const key = item.id || item.name;
      if (!itemSalesMap[key]) {
        itemSalesMap[key] = { qty: 0, revenue: 0 };
      }
      itemSalesMap[key].qty += item.quantity;
      itemSalesMap[key].revenue += item.price * item.quantity;
    });
  });

  // Calculate detailed per-product financial matrix
  let totalNetProfit = 0;
  let totalCOGS = 0;

  const productProfitMatrix = products.map(p => {
    const cost = p.costPrice && p.costPrice > 0 ? p.costPrice : Math.round(p.price * 0.55);
    const unitProfit = p.price - cost;
    const margin = p.price > 0 ? Math.round((unitProfit / p.price) * 100) : 0;

    const salesKey = Object.keys(itemSalesMap).find(k => k === p.id || k === p.name) || p.id;
    const sales = itemSalesMap[salesKey] || { qty: 0, revenue: 0 };

    const productRevenue = sales.revenue;
    const productCost = sales.qty * cost;
    const productNetProfit = productRevenue - productCost;

    totalNetProfit += productNetProfit;
    totalCOGS += productCost;

    return {
      product: p,
      costPrice: cost,
      unitPrice: p.price,
      unitProfit,
      marginPercent: margin,
      unitsSold: sales.qty,
      revenue: productRevenue,
      costTotal: productCost,
      netProfit: productNetProfit,
      profitSharePercent: 0
    };
  });

  // Compute profit share percentage and identify leaders
  productProfitMatrix.forEach(item => {
    item.profitSharePercent = totalNetProfit > 0 ? Math.round((item.netProfit / totalNetProfit) * 100) : 0;
  });

  const overallProfitMargin = totalRevenue > 0 ? Math.round((totalNetProfit / totalRevenue) * 100) : 0;

  // Identify Top Performers
  const sortedByNetProfit = [...productProfitMatrix].sort((a, b) => b.netProfit - a.netProfit);
  const sortedByVolume = [...productProfitMatrix].sort((a, b) => b.unitsSold - a.unitsSold);
  const sortedByMarginPercent = [...productProfitMatrix].sort((a, b) => b.marginPercent - a.marginPercent);

  const topProfitableProduct = sortedByNetProfit[0];
  const topVolumeProduct = sortedByVolume[0];
  const topMarginProduct = sortedByMarginPercent[0];

  // Category sales breakdown from order items
  const categorySalesMap: Record<string, number> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const catalogProd = products.find(p => p.id === item.id || p.name === item.name);
      const cat = catalogProd?.category || 'TOPS';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + (item.price * item.quantity);
    });
  });

  // Top Sold Products
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number; image: string }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSalesMap[item.name]) {
        productSalesMap[item.name] = { name: item.name, qty: 0, revenue: 0, image: item.image };
      }
      productSalesMap[item.name].qty += item.quantity;
      productSalesMap[item.name].revenue += item.price * item.quantity;
    });
  });
  const topSellingProducts = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Catalog Stats
  const catalogTotalValue = products.reduce((acc, p) => acc + p.price, 0);
  const avgProductPrice = products.length > 0 ? Math.round(catalogTotalValue / products.length) : 0;

  const stats = [
    { label: lang === 'ar' ? 'إجمالي المبيعات' : 'TOTAL REVENUE', value: `${totalRevenue.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`, icon: DollarSign, badge: 'REAL DATA' },
    { label: lang === 'ar' ? 'صافي الأرباح' : 'NET PROFIT', value: `${totalNetProfit.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`, icon: TrendingUp, badge: `${overallProfitMargin}% ${lang === 'ar' ? 'هامش' : 'MARGIN'}` },
    { label: lang === 'ar' ? 'الطلبات النشطة' : 'ACTIVE ORDERS', value: activeOrdersCount.toString(), icon: Package, badge: `${orders.length} ${lang === 'ar' ? 'إجمالي' : 'TOTAL'}` },
    { label: lang === 'ar' ? 'العملاء المسجلين' : 'REGISTERED CUSTOMERS', value: totalCustomersCount.toString(), icon: Users, badge: lang === 'ar' ? 'عملاء حقيقيين' : 'REAL USERS' }
  ];

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setOriginalPrice('');
    setCostPrice('');
    setCategory("TOPS");
    setGender('Unisex');
    setIsNew(false);
    setImageUrl('');
    setImagesList([]);
    setNewImageUrlInput('');
    setSkuInput('');
    setStockInput('24');
    setVisibilityInput('Published');
    setIsSoldOut(false);
    setSizesInput(['S', 'M', 'L', 'XL']);
    setIsProductModalOpen(false);
  };

  const handleProductImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray: File[] = Array.from(files);
    const readers = fileArray.map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newImages => {
      setImagesList(prev => {
        const updated = [...prev, ...newImages];
        if (!imageUrl && updated.length > 0) setImageUrl(updated[0]);
        return updated;
      });
    });
  };

  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    const url = newImageUrlInput.trim();
    setImagesList(prev => {
      const updated = [...prev, url];
      if (!imageUrl) setImageUrl(updated[0]);
      return updated;
    });
    setNewImageUrlInput('');
  };

  const handleRemoveImageFromList = (index: number) => {
    setImagesList(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0) {
        setImageUrl(updated[0]);
      } else {
        setImageUrl('');
      }
      return updated;
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setImagesList(prev => {
      if (index === 0 || index >= prev.length) return prev;
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      const reordered = [target, ...rest];
      setImageUrl(target);
      return reordered;
    });
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    
    const finalImagesList = imagesList.length > 0 
      ? imagesList 
      : (imageUrl ? [imageUrl] : ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800']);
    const finalImage = finalImagesList[0];
    const parsedPrice = Number(price);
    const parsedCost = costPrice ? Number(costPrice) : Math.round(parsedPrice * 0.55);
    const parsedStock = Number(stockInput) || 24;
    const generatedSku = skuInput.trim() || `SKU-A7-${Date.now().toString().slice(-5)}`;
    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (editingId) {
      const existingProduct = products.find(p => p.id === editingId);
      if (existingProduct) {
        onUpdateProduct({
          ...existingProduct,
          name,
          price: parsedPrice,
        originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,
          costPrice: parsedCost,
          image: finalImage,
          images: finalImagesList,
          category,
          gender,
          isNew,
          sizes: sizesInput,
          sku: generatedSku,
          stock: parsedStock,
          status: isSoldOut ? 'Out of Stock' : (parsedStock > 10 ? 'In Stock' : parsedStock > 0 ? 'Low Stock' : 'Out of Stock'),
          visibility: visibilityInput,
          isSoldOut,
          lastUpdated: todayFormatted
        });
      }
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name,
        price: parsedPrice,
        originalPrice: !isNaN(parsedOriginalPrice) ? parsedOriginalPrice : undefined,
        costPrice: parsedCost,
        image: finalImage,
        images: finalImagesList,
        category,
        gender,
        isNew,
        sizes: sizesInput,
        sku: generatedSku,
        stock: parsedStock,
        status: isSoldOut ? 'Out of Stock' : (parsedStock > 10 ? 'In Stock' : parsedStock > 0 ? 'Low Stock' : 'Out of Stock'),
        visibility: visibilityInput,
        isSoldOut,
        notifySubscribers: [],
        lastUpdated: todayFormatted
      };
      onAddProduct(newProduct);
    }
    resetForm();
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
    setCostPrice(product.costPrice ? product.costPrice.toString() : Math.round(product.price * 0.55).toString());
    setImageUrl(product.image);
    const productImgs = (product.images && product.images.length > 0)
      ? product.images
      : (product.image ? [product.image] : []);
    setImagesList(productImgs);
    setCategory(product.category);
    setGender(product.gender);
    setIsNew(product.isNew || false);
    setSkuInput(product.sku || `SKU-A7-${product.id.slice(0, 6).toUpperCase()}`);
    setStockInput((product.stock ?? 24).toString());
    setVisibilityInput(product.visibility === 'Draft' ? 'Draft' : 'Published');
    setIsSoldOut(product.isSoldOut || false);
    setSizesInput(product.sizes || ['S', 'M', 'L', 'XL']);
    setIsProductModalOpen(true);
  };

  const handleDuplicateProduct = (p: Product) => {
    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const duplicated: Product = {
      ...p,
      id: `prod-${Date.now()}`,
      name: `${p.name} (Copy)`,
      sku: p.sku ? `${p.sku}-COPY` : `SKU-A7-${Date.now().toString().slice(-5)}`,
      lastUpdated: todayFormatted
    };
    onAddProduct(duplicated);
  };

  const handleToggleVisibility = (p: Product) => {
    const newVis = p.visibility === 'Draft' ? 'Published' : 'Draft';
    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    onUpdateProduct({
      ...p,
      visibility: newVis,
      lastUpdated: todayFormatted
    });
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllProducts = (filteredIds: string[]) => {
    if (selectedProductIds.length === filteredIds.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredIds);
    }
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(lang === 'ar' ? `هل أنت تأكد من حذف ${selectedProductIds.length} منتج؟` : `Are you sure you want to delete ${selectedProductIds.length} selected products?`)) {
      selectedProductIds.forEach(id => onDeleteProduct(id));
      setSelectedProductIds([]);
    }
  };

  const handleBulkArchive = () => {
    if (selectedProductIds.length === 0) return;
    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    selectedProductIds.forEach(id => {
      const p = products.find(item => item.id === id);
      if (p) {
        onUpdateProduct({ ...p, visibility: 'Draft', lastUpdated: todayFormatted });
      }
    });
    setSelectedProductIds([]);
  };

  const handleBulkPublish = () => {
    if (selectedProductIds.length === 0) return;
    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    selectedProductIds.forEach(id => {
      const p = products.find(item => item.id === id);
      if (p) {
        onUpdateProduct({ ...p, visibility: 'Published', lastUpdated: todayFormatted });
      }
    });
    setSelectedProductIds([]);
  };

  const filteredAndSortedProducts = products.filter(p => {
    const query = productSearch.trim().toLowerCase();
    const pSku = p.sku || `SKU-A7-${p.id.slice(0, 6).toUpperCase()}`;
    const matchesSearch = !query || 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      pSku.toLowerCase().includes(query);
      
    const matchesCategory = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;

    const pStock = p.stock ?? 24;
    const pVis = p.visibility || 'Published';

    let matchesStatus = true;
    if (productStatusFilter === 'IN_STOCK') matchesStatus = pStock > 0;
    else if (productStatusFilter === 'LOW_STOCK') matchesStatus = pStock > 0 && pStock <= 10;
    else if (productStatusFilter === 'OUT_OF_STOCK') matchesStatus = pStock === 0;
    else if (productStatusFilter === 'PUBLISHED') matchesStatus = pVis === 'Published';
    else if (productStatusFilter === 'DRAFT') matchesStatus = pVis === 'Draft' || pVis === 'Archived';

    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    const costA = a.costPrice && a.costPrice > 0 ? a.costPrice : Math.round(a.price * 0.55);
    const costB = b.costPrice && b.costPrice > 0 ? b.costPrice : Math.round(b.price * 0.55);
    const profitA = a.price - costA;
    const profitB = b.price - costB;
    const stockA = a.stock ?? 24;
    const stockB = b.stock ?? 24;

    if (productSort === 'price-high') return b.price - a.price;
    if (productSort === 'price-low') return a.price - b.price;
    if (productSort === 'profit-high') return profitB - profitA;
    if (productSort === 'stock-low') return stockA - stockB;
    if (productSort === 'name-asc') return a.name.localeCompare(b.name);
    return 0; // 'newest' default
  });

  const [newImage, setNewImage] = useState('');
  const [newOffer, setNewOffer] = useState('');

  // Upload Hero Image from Device File Input
  const handleHeroImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert(lang === 'ar' ? 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت' : 'Image too large. Max 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onUpdateSettings({ ...settings, heroImages: [...settings.heroImages, reader.result] });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = () => {
    if (!newImage) return;
    onUpdateSettings({ ...settings, heroImages: [...settings.heroImages, newImage] });
    setNewImage('');
  };

  const handleAddOffer = () => {
    if (!newOffer) return;
    onUpdateSettings({ ...settings, offers: [...settings.offers, newOffer] });
    setNewOffer('');
  };

  const removeImage = (idx: number) => {
    const updated = [...settings.heroImages];
    updated.splice(idx, 1);
    onUpdateSettings({ ...settings, heroImages: updated });
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f5f7] text-zinc-900 dark:bg-[#060205] dark:text-[#f5f5f7] pt-4 sm:pt-6 pb-8 px-3 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="w-full max-w-[1650px] mx-auto flex flex-col lg:flex-row gap-5 lg:gap-6 items-start min-h-[calc(100vh-3rem)]">
        
        {/* EXECUTIVE COLLAPSIBLE SIDEBAR NAVIGATION */}
        <aside className={`w-full ${
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64 xl:w-72'
        } transition-all duration-300 ease-in-out shrink-0 bg-white/95 dark:bg-[#0d060b]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl ${
          isSidebarCollapsed ? 'p-2 sm:p-3' : 'p-3 sm:p-5'
        } shadow-xl flex flex-col justify-between lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar z-30`}>
          
          <div className="flex flex-col h-full justify-between min-h-0">
            <div className="flex flex-col min-h-0">
              
              {/* Sidebar Header with Collapse Toggle Button */}
              {isSidebarCollapsed ? (
                <div className="hidden lg:flex flex-col items-center gap-2 border-b border-black/10 dark:border-white/10 pb-3 mb-3 shrink-0">
                  <button 
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="p-2 rounded-xl text-zinc-700 dark:text-zinc-200 bg-black/5 dark:bg-white/10 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-black transition-all cursor-pointer"
                    title={lang === 'ar' ? 'توسيع القائمة' : 'Expand Sidebar'}
                  >
                    <PanelLeftOpen className="w-5 h-5 rtl:rotate-180" />
                  </button>
                  <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs shadow-md">
                    A7
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3 mb-3 shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-xs shadow-md shrink-0">
                      A7
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white leading-tight truncate">
                        {lang === 'ar' ? 'لوحة التحكم' : 'A7 CONTROL'}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {lang === 'ar' ? 'إدارة المتجر' : 'Store Management'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={onBackToStore}
                      className="lg:hidden p-1.5 rounded-lg text-xs font-bold text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white bg-black/5 dark:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer"
                      title={lang === 'ar' ? 'العودة للمتجر' : 'STORE'}
                    >
                      <ArrowLeft size={14} className="rtl:rotate-180" />
                      <span className="text-[10px]">{lang === 'ar' ? 'المتجر' : 'STORE'}</span>
                    </button>
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="lg:hidden p-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-900/30 transition-colors flex items-center gap-1 cursor-pointer"
                        title={lang === 'ar' ? 'تسجيل الخروج' : 'LOGOUT'}
                      >
                        <LogOut size={14} />
                      </button>
                    )}
                    <button 
                      onClick={() => setIsSidebarCollapsed(true)}
                      className="hidden lg:inline-flex p-1.5 rounded-lg text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                      title={lang === 'ar' ? 'طي القائمة لتوفير مساحة' : 'Collapse Sidebar'}
                    >
                      <PanelLeftClose className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* Nav Items List (Horizontal scroll on mobile < lg, Vertical list on desktop >= lg) */}
              <nav className="flex lg:flex-col gap-1.5 lg:gap-1 text-xs font-medium overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 scrollbar-none">
                {[
                  { id: 'overview', icon: LayoutDashboard, labelAr: 'لوحة التحكم', labelEn: 'Dashboard', badge: null },
                  { id: 'products', icon: Package, labelAr: 'المنتجات', labelEn: 'Products', badge: products.length },
                  { id: 'orders', icon: ShoppingBag, labelAr: 'الطلبات', labelEn: 'Orders', badge: orders.length },
                  { id: 'users', icon: Users, labelAr: 'العملاء', labelEn: 'Customers', badge: registeredUsers.length },
                  { id: 'analytics', icon: BarChart2, labelAr: 'التحليلات', labelEn: 'Analytics', badge: 'PRO' },
                  { id: 'coupons', icon: Ticket, labelAr: 'الكوبونات', labelEn: 'Coupons', badge: settings.coupons?.length || null },
                  { id: 'shipping', icon: Truck, labelAr: 'الشحن', labelEn: 'Shipping', badge: null },
                  { id: 'reviews', icon: Star, labelAr: 'التقييمات', labelEn: 'Reviews', badge: reviewsList.length },
                  { id: 'notifications', icon: MessageSquare, labelAr: 'طلبات التوفر', labelEn: 'Restock Req', badge: notificationsList.filter(n => !n.notified).length || null },
                  { id: 'admin-alerts', icon: Bell, labelAr: 'التنبيهات', labelEn: 'Push Alerts', badge: adminNotifications.filter(n => !n.isRead).length || null },
                  { id: 'storefront', icon: Sparkles, labelAr: 'العروض والبقلاية', labelEn: 'Banners', badge: null },
                  { id: 'settings', icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings', badge: null },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const label = lang === 'ar' ? item.labelAr : item.labelEn;

                  // Format badge value
                  const rawBadge = item.badge;
                  const hasBadge = rawBadge !== null && rawBadge !== 0 && rawBadge !== undefined;
                  const displayBadge = typeof rawBadge === 'number' 
                    ? (rawBadge > 99 ? '99+' : rawBadge) 
                    : rawBadge;

                  if (isSidebarCollapsed) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        title={label}
                        className={`shrink-0 lg:w-full h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer relative group ${
                          isActive
                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                          <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400 dark:text-amber-600' : 'text-zinc-500'}`} />
                          {hasBadge && (
                            <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-amber-500 text-zinc-950 border-2 border-white dark:border-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.15)] z-10 pointer-events-none">
                              {displayBadge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  }

                  const isNotificationItem = item.id === 'notifications';
                  const isProItem = item.id === 'analytics';

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`shrink-0 lg:w-full h-10 flex items-center justify-between px-3 rounded-xl transition-all duration-200 cursor-pointer group whitespace-nowrap ${
                        isActive
                          ? 'bg-black text-white dark:bg-white dark:text-black font-bold shadow-md'
                          : 'bg-zinc-100/70 lg:bg-transparent text-zinc-700 dark:bg-white/5 lg:dark:bg-transparent dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Column 1: Icon container with fixed dimensions */}
                        <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-amber-400 dark:text-amber-600' : 'text-zinc-400 dark:text-zinc-500'}`} />
                          {/* Floating Notification Badge on Icon top-right */}
                          {isNotificationItem && hasBadge && (
                            <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full bg-amber-500 text-zinc-950 border-2 border-white dark:border-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.15)] z-10 pointer-events-none">
                              {displayBadge}
                            </span>
                          )}
                        </div>

                        {/* Column 2: Label text */}
                        <span className="tracking-wide text-xs truncate">{label}</span>
                      </div>

                      {/* Right-side elements */}
                      {isProItem && (
                        <span className="ml-auto rtl:mr-auto rtl:ml-0 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30 shrink-0">
                          PRO
                        </span>
                      )}

                      {!isNotificationItem && !isProItem && hasBadge && (
                        <span className={`ml-auto rtl:mr-auto rtl:ml-0 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full transition-colors shrink-0 min-w-[20px] h-[18px] flex items-center justify-center border border-black/10 dark:border-white/10 ${
                          isActive 
                            ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black' 
                            : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                        }`}>
                          {displayBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="hidden lg:flex mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex-col gap-2 shrink-0">
              <button 
                onClick={onBackToStore} 
                title={lang === 'ar' ? 'العودة للمتجر الرئيسي' : 'BACK TO STORE'}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 transition-all border border-black/5 dark:border-white/10 cursor-pointer ${
                  isSidebarCollapsed ? 'px-2' : ''
                }`}
              >
                <ArrowLeft size={16} className="rtl:rotate-180 shrink-0" /> 
                {!isSidebarCollapsed && (
                  <span className="truncate">{lang === 'ar' ? 'العودة للمتجر الرئيسي' : 'BACK TO STORE'}</span>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT CONTAINER WITH TIGHT COMPACT PADDING */}
        <div className="flex-1 w-full min-w-0 bg-white/95 dark:bg-[#0a0407]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xl shadow-black/5 dark:shadow-black/50 flex flex-col gap-6">
          {/* Restock Notification Trigger Toast Alert */}
          {restockAlertToast && (
            <div className="p-4 bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 rounded-xl flex items-center justify-between gap-3 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-600 dark:text-amber-400">
                  <Bell size={20} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase luxury-tracking">
                    {lang === 'ar' ? 'تم تفعيل نظام الإشعارات بنجاح! 🔔' : 'RESTOCK NOTIFICATION SYSTEM TRIGGERED! 🔔'}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    {lang === 'ar' 
                      ? `تم إرسال إشعار التوفر لعدد ${restockAlertToast.count} عميل بانتظار المنتج: ${restockAlertToast.productName}`
                      : `Automatically notified ${restockAlertToast.count} subscriber(s) on waitlist for: ${restockAlertToast.productName}`
                    }
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setRestockAlertToast(null)}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">
              {/* KPIs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 shadow-xs p-4 sm:p-5 flex flex-col justify-between h-full rounded-2xl gap-4">
                    <div className="flex justify-between items-center text-zinc-500 dark:text-white/50">
                      <stat.icon size={18} strokeWidth={1.5} />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {stat.badge}
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-light tracking-tight">{stat.value}</div>
                      <div className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-white/50 mt-1 font-semibold">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Recent Orders & Users Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 shadow-sm p-6 sm:p-8 rounded-2xl flex flex-col gap-6 justify-between h-full">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                    <h3 className="text-xs luxury-tracking uppercase font-bold text-zinc-800 dark:text-white/90">RECENT REAL ORDERS</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[10px] luxury-tracking text-zinc-500 hover:text-black dark:text-white/50 dark:hover:text-white uppercase font-bold cursor-pointer">
                      VIEW ALL
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-16 text-zinc-400 dark:text-white/30 text-xs luxury-tracking uppercase">
                      NO ORDERS PLACED YET. ORDERS FROM CUSTOMERS WILL APPEAR HERE IN REAL-TIME.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {orders.slice(0, 5).map((ord, idx) => (
                        <div key={`${ord.id}-${idx}`} className="p-4 bg-zinc-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 rounded-xl flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[11px] luxury-tracking">
                            <span className="font-bold text-zinc-900 dark:text-white">#{ord.id} - {ord.customerName}</span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{ord.totalAmount.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] luxury-tracking text-zinc-500 dark:text-white/50">
                            <span className="flex items-center gap-1"><Phone size={12} /> {ord.customerPhone}</span>
                            <span className="uppercase text-[9px] px-2 py-0.5 font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md">{ord.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Registered Customers */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 shadow-sm p-6 sm:p-8 rounded-2xl flex flex-col gap-6 justify-between h-full">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                    <h3 className="text-xs luxury-tracking uppercase font-bold text-zinc-800 dark:text-white/90">REGISTERED CUSTOMERS</h3>
                    <button onClick={() => setActiveTab('users')} className="text-[10px] luxury-tracking text-zinc-500 hover:text-black dark:text-white/50 dark:hover:text-white uppercase font-bold cursor-pointer">
                      VIEW ALL
                    </button>
                  </div>

                  {registeredUsers.length === 0 ? (
                    <div className="text-center py-16 text-zinc-400 dark:text-white/30 text-xs luxury-tracking uppercase">
                      NO CUSTOMERS REGISTERED YET. ACCOUNTS CREATED ON SITE WILL BE LISTED HERE WITH PHONE NUMBERS.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {registeredUsers.slice(0, 5).map((usr, idx) => (
                        <div key={`${usr.id}-${idx}`} className="p-4 bg-zinc-50 dark:bg-[#050505] border border-black/5 dark:border-white/5 rounded-xl flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[11px] luxury-tracking font-bold text-zinc-900 dark:text-white">
                            <span>{usr.name || 'Anonymous User'}</span>
                            <span className="text-[9px] font-normal text-zinc-400 dark:text-white/40">{(usr.role || 'user').toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] luxury-tracking text-zinc-500 dark:text-white/50">
                            <span className="flex items-center gap-1"><Mail size={12} /> {usr.email}</span>
                            <span className="flex items-center gap-1 font-mono font-medium text-zinc-800 dark:text-white/80"><Phone size={12} /> {usr.phone || 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANALYTICS & PROFIT ENGINE (تحليلات المبيعات والأرباح التفصيلية) */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col gap-10">
              
              {/* Financial Header Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Net Profit Card */}
                <div className="bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/20 dark:via-[#0A0A0A] dark:to-[#0A0A0A] text-zinc-900 dark:text-white border border-emerald-500/30 p-6 flex flex-col gap-3 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={22} />
                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 border border-emerald-500/30 uppercase">
                      {lang === 'ar' ? 'صافي الأرباح' : 'NET PROFIT'}
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-light font-mono tracking-tight text-emerald-600 dark:text-emerald-400 font-bold">
                      {totalNetProfit.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </div>
                    <div className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-white/60 mt-1 font-semibold flex items-center justify-between">
                      <span>{lang === 'ar' ? 'صافي الأرباح الكلية المحققة' : 'TOTAL REALIZED NET PROFIT'}</span>
                      <span className="text-emerald-600 font-bold">{overallProfitMargin}% {lang === 'ar' ? 'هامش' : 'MARGIN'}</span>
                    </div>
                  </div>
                  <div className="w-full bg-emerald-500/10 h-1.5 mt-1 overflow-hidden rounded-full">
                    <div style={{ width: `${Math.min(100, overallProfitMargin)}%` }} className="bg-emerald-500 h-full" />
                  </div>
                </div>

                {/* Total Revenue Card */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                    <DollarSign size={22} />
                    <span className="text-[9px] font-bold bg-indigo-500/10 px-2.5 py-1 border border-indigo-500/20 uppercase">
                      {lang === 'ar' ? 'المبيعات' : 'REVENUE'}
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-light font-mono tracking-tight">{totalRevenue.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</div>
                    <div className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-white/50 mt-1 font-semibold">
                      {lang === 'ar' ? 'إجمالي المبيعات' : 'TOTAL REVENUE GENERATED'}
                    </div>
                  </div>
                </div>

                {/* Total COGS Card */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                    <ShoppingBag size={22} />
                    <span className="text-[9px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 border border-rose-500/20 uppercase">
                      {lang === 'ar' ? 'التكلفة الكلية' : 'TOTAL COGS'}
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-light font-mono tracking-tight text-rose-600 dark:text-rose-400">
                      {totalCOGS.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </div>
                    <div className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-white/50 mt-1 font-semibold">
                      {lang === 'ar' ? 'تكلفة شراء البضاعة المباعة' : 'COST OF GOODS SOLD'}
                    </div>
                  </div>
                </div>

                {/* Average Order Value Card */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-3 shadow-sm">
                  <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
                    <BarChart2 size={22} />
                    <span className="text-[9px] font-bold bg-amber-500/10 px-2.5 py-1 border border-amber-500/20 uppercase">
                      {lang === 'ar' ? 'متوسط السلة' : 'AVG BASKET'}
                    </span>
                  </div>
                  <div>
                    <div className="text-3xl font-light font-mono tracking-tight">{averageOrderValue.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</div>
                    <div className="text-[10px] luxury-tracking uppercase text-zinc-500 dark:text-white/50 mt-1 font-semibold">
                      {lang === 'ar' ? 'متوسط قيمة الطلب الواحد' : 'AVERAGE ORDER VALUE'}
                    </div>
                  </div>
                </div>

              </div>

              {/* Profit Champions Spotlight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Top Profit Leader */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-emerald-500/30 p-6 flex flex-col gap-4 shadow-sm relative">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="text-xs font-bold uppercase luxury-tracking text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <Award size={16} /> 👑 {lang === 'ar' ? 'الأعلى أرباحاً' : 'TOP PROFIT LEADER'}
                    </span>
                    <span className="text-[9px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 border border-emerald-500/20">
                      #{topProfitableProduct ? topProfitableProduct.profitSharePercent : 0}% {lang === 'ar' ? 'من أرباح المتجر' : 'STORE PROFIT SHARE'}
                    </span>
                  </div>

                  {topProfitableProduct && topProfitableProduct.netProfit > 0 ? (
                    <div className="flex items-center gap-4">
                      <img src={topProfitableProduct.product.image} alt={topProfitableProduct.product.name} className="w-16 h-20 object-cover border border-black/10 dark:border-white/10" />
                      <div className="flex flex-col gap-1 text-xs luxury-tracking">
                        <span className="font-bold line-clamp-1">{topProfitableProduct.product.name}</span>
                        <span className="text-zinc-500 text-[10px]">
                          {lang === 'ar' ? `المبيعات: ${topProfitableProduct.unitsSold} قطعة` : `Units Sold: ${topProfitableProduct.unitsSold}`}
                        </span>
                        <div className="mt-1">
                          <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 block">
                            +{topProfitableProduct.netProfit.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'} {lang === 'ar' ? 'أرباح صافية' : 'Net Profit'}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono">
                            {lang === 'ar' ? `هامش ربح القطعة: ${topProfitableProduct.marginPercent}%` : `Unit Margin: ${topProfitableProduct.marginPercent}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-zinc-400 text-xs">
                      {lang === 'ar' ? 'لا توجد مبيعات مكتملة بعد لتحديد المنتج الأعلى ربحاً' : 'No completed sales yet to identify top profit leader'}
                    </div>
                  )}
                </div>

                {/* Top Volume Best Seller */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="text-xs font-bold uppercase luxury-tracking text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Zap size={16} /> 🔥 {lang === 'ar' ? 'الأكثر مبيعاً بالكمية' : 'BEST SELLER BY VOLUME'}
                    </span>
                    <span className="text-[9px] font-bold font-mono bg-amber-500/10 text-amber-600 px-2 py-0.5 border border-amber-500/20">
                      VOLUME LEADER
                    </span>
                  </div>

                  {topVolumeProduct && topVolumeProduct.unitsSold > 0 ? (
                    <div className="flex items-center gap-4">
                      <img src={topVolumeProduct.product.image} alt={topVolumeProduct.product.name} className="w-16 h-20 object-cover border border-black/10 dark:border-white/10" />
                      <div className="flex flex-col gap-1 text-xs luxury-tracking">
                        <span className="font-bold line-clamp-1">{topVolumeProduct.product.name}</span>
                        <span className="text-amber-600 font-bold font-mono text-sm">
                          {lang === 'ar' ? `${topVolumeProduct.unitsSold} قطعة تم بيعها` : `${topVolumeProduct.unitsSold} units sold`}
                        </span>
                        <div className="mt-1">
                          <span className="font-mono text-xs font-bold text-zinc-800 dark:text-white block">
                            {lang === 'ar' ? `إجمالي المبيعات: ${topVolumeProduct.revenue.toLocaleString()} ج.م` : `Total Revenue: ${topVolumeProduct.revenue.toLocaleString()} EGP`}
                          </span>
                          <span className="text-[9px] text-emerald-600 font-mono font-bold">
                            {lang === 'ar' ? `صافي الربح: +${topVolumeProduct.netProfit.toLocaleString()} ج.م` : `Net Profit: +${topVolumeProduct.netProfit.toLocaleString()} EGP`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-zinc-400 text-xs">
                      {lang === 'ar' ? 'لا توجد مبيعات مسجلة حتى الآن' : 'No sales recorded yet'}
                    </div>
                  )}
                </div>

                {/* Top Profit Margin Star */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-4 shadow-sm">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="text-xs font-bold uppercase luxury-tracking text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Sparkles size={16} /> 💎 {lang === 'ar' ? 'أعلى هامش ربحية' : 'HIGHEST MARGIN STAR'}
                    </span>
                    <span className="text-[9px] font-bold font-mono bg-indigo-500/10 text-indigo-600 px-2 py-0.5 border border-indigo-500/20">
                      PROFITABILITY STAR
                    </span>
                  </div>

                  {topMarginProduct ? (
                    <div className="flex items-center gap-4">
                      <img src={topMarginProduct.product.image} alt={topMarginProduct.product.name} className="w-16 h-20 object-cover border border-black/10 dark:border-white/10" />
                      <div className="flex flex-col gap-1 text-xs luxury-tracking">
                        <span className="font-bold line-clamp-1">{topMarginProduct.product.name}</span>
                        <span className="text-indigo-600 font-bold font-mono text-sm">
                          {lang === 'ar' ? `هامش ربح: ${topMarginProduct.marginPercent}%` : `Profit Margin: ${topMarginProduct.marginPercent}%`}
                        </span>
                        <div className="mt-1">
                          <span className="text-[10px] text-zinc-500 block">
                            {lang === 'ar' ? `السعر: ${topMarginProduct.unitPrice} | التكلفة: ${topMarginProduct.costPrice} ج.م` : `Price: ${topMarginProduct.unitPrice} | Cost: ${topMarginProduct.costPrice} EGP`}
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-600">
                            {lang === 'ar' ? `ربح القطعة: +${topMarginProduct.unitProfit} ج.م` : `Unit Profit: +${topMarginProduct.unitProfit} EGP`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-zinc-400 text-xs">
                      {lang === 'ar' ? 'لا توجد منتجات متوفرة' : 'No products available'}
                    </div>
                  )}
                </div>

              </div>

              {/* PER-PRODUCT DETAILED PROFIT TABLE */}
              <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-6 shadow-sm">
                
                {/* Table Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-black/10 dark:border-white/10 pb-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase luxury-tracking text-zinc-900 dark:text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-emerald-500" />
                      {lang === 'ar' ? 'جدول أرباح وتكاليف كل منتج بالتفصيل' : 'PER-PRODUCT PROFIT & COST MATRIX'}
                    </h3>
                    <p className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 mt-1">
                      {lang === 'ar' ? 'حسابات تلقائية دقيقة للربح الصافي والتكلفة وهامش الربح لكل منتج' : 'Automated net profit calculations, unit costs, and margins for every product'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 md:w-64">
                      <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        value={profitSearch}
                        onChange={(e) => setProfitSearch(e.target.value)}
                        placeholder={lang === 'ar' ? 'ابحث باسم المنتج...' : 'Search product name...'}
                        className="w-full bg-zinc-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 pr-9 pl-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>

                    {/* Sorting Selector */}
                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 px-3 py-1.5">
                      <ArrowUpDown size={14} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">{lang === 'ar' ? 'ترتيب حسب:' : 'SORT BY:'}</span>
                      <select
                        value={profitSort}
                        onChange={(e) => setProfitSort(e.target.value as any)}
                        className="bg-transparent text-xs font-bold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        <option value="profit" className="bg-white dark:bg-[#0A0A0A]">{lang === 'ar' ? 'الأعلى أرباحاً' : 'Highest Net Profit'}</option>
                        <option value="qty" className="bg-white dark:bg-[#0A0A0A]">{lang === 'ar' ? 'الأكثر مبيعاً بالكمية' : 'Most Units Sold'}</option>
                        <option value="margin" className="bg-white dark:bg-[#0A0A0A]">{lang === 'ar' ? 'أعلى هامش ربح' : 'Highest Profit Margin %'}</option>
                        <option value="price" className="bg-white dark:bg-[#0A0A0A]">{lang === 'ar' ? 'أعلى سعر بيع' : 'Highest Selling Price'}</option>
                        <option value="cost" className="bg-white dark:bg-[#0A0A0A]">{lang === 'ar' ? 'أعلى سعر تكلفة' : 'Highest Cost Price'}</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className={`w-full text-xs luxury-tracking ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                    <thead>
                      <tr className="border-b border-black/10 dark:border-white/10 text-zinc-500 dark:text-white/50 text-[10px] uppercase font-bold bg-zinc-50 dark:bg-white/5">
                        <th className="p-3">{lang === 'ar' ? 'المنتج' : 'PRODUCT'}</th>
                        <th className="p-3">{lang === 'ar' ? 'سعر البيع' : 'SELLING PRICE'}</th>
                        <th className="p-3">{lang === 'ar' ? 'التكلفة (سعر الشراء)' : 'COST PRICE'}</th>
                        <th className="p-3">{lang === 'ar' ? 'ربح القطعة الواحدة' : 'UNIT PROFIT'}</th>
                        <th className="p-3">{lang === 'ar' ? 'هامش الربح %' : 'MARGIN %'}</th>
                        <th className="p-3">{lang === 'ar' ? 'الكمية المباعة' : 'UNITS SOLD'}</th>
                        <th className="p-3 text-emerald-600 dark:text-emerald-400 font-extrabold">{lang === 'ar' ? 'صافي أرباح المنتج' : 'NET PROFIT'}</th>
                        <th className="p-3">{lang === 'ar' ? 'نسبة المساهمة' : 'PROFIT SHARE'}</th>
                        <th className="p-3 text-center">{lang === 'ar' ? 'التقييم والتوصية' : 'STATUS / EVALUATION'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {productProfitMatrix
                        .filter(item => item.product.name.toLowerCase().includes(profitSearch.toLowerCase()))
                        .sort((a, b) => {
                          if (profitSort === 'profit') return b.netProfit - a.netProfit;
                          if (profitSort === 'qty') return b.unitsSold - a.unitsSold;
                          if (profitSort === 'margin') return b.marginPercent - a.marginPercent;
                          if (profitSort === 'price') return b.unitPrice - a.unitPrice;
                          if (profitSort === 'cost') return b.costPrice - a.costPrice;
                          return 0;
                        })
                        .map((item, idx) => {
                          const isTopProfit = topProfitableProduct?.product.id === item.product.id && item.netProfit > 0;
                          const isTopVolume = topVolumeProduct?.product.id === item.product.id && item.unitsSold > 0;

                          return (
                            <tr key={`${item.product.id}-${idx}`} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                              {/* Product Info */}
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <img src={item.product.image} alt={item.product.name} className="w-10 h-12 object-cover border border-black/10 dark:border-white/10" />
                                  <div className="flex flex-col">
                                    <span className="font-bold text-zinc-900 dark:text-white line-clamp-1">{item.product.name}</span>
                                    <span className="text-[9px] text-zinc-400 uppercase font-mono">{item.product.category} • {item.product.gender}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Selling Price */}
                              <td className="p-3 font-mono font-bold text-zinc-900 dark:text-white">
                                {item.unitPrice.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                              </td>

                              {/* Cost Price */}
                              <td className="p-3 font-mono text-zinc-500 dark:text-white/60">
                                {item.costPrice.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                              </td>

                              {/* Unit Profit */}
                              <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                +{item.unitProfit.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                              </td>

                              {/* Margin % */}
                              <td className="p-3">
                                <span className={`inline-block px-2 py-0.5 font-mono text-[10px] font-bold border ${
                                  item.marginPercent >= 50
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                    : item.marginPercent >= 35
                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                    : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                                }`}>
                                  {item.marginPercent}%
                                </span>
                              </td>

                              {/* Units Sold */}
                              <td className="p-3 font-mono font-bold text-zinc-800 dark:text-white/90">
                                {item.unitsSold} {lang === 'ar' ? 'قطعة' : 'units'}
                              </td>

                              {/* Net Profit Generated */}
                              <td className="p-3 font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                                +{item.netProfit.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                              </td>

                              {/* Profit Share % Progress */}
                              <td className="p-3">
                                <div className="flex flex-col gap-1 w-24">
                                  <span className="text-[9px] font-mono text-zinc-500 font-bold">
                                    {item.profitSharePercent}% {lang === 'ar' ? 'من الأرباح' : 'of profit'}
                                  </span>
                                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-white/10 overflow-hidden rounded-full">
                                    <div style={{ width: `${Math.min(100, item.profitSharePercent)}%` }} className="h-full bg-emerald-500" />
                                  </div>
                                </div>
                              </td>

                              {/* Status Tag */}
                              <td className="p-3 text-center">
                                {isTopProfit && (
                                  <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-1 text-[9px] font-bold uppercase">
                                    👑 {lang === 'ar' ? 'الأعلى ربحاً' : 'TOP PROFIT'}
                                  </span>
                                )}
                                {isTopVolume && !isTopProfit && (
                                  <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/30 px-2 py-1 text-[9px] font-bold uppercase">
                                    🔥 {lang === 'ar' ? 'الأكثر مبيعاً' : 'BEST SELLER'}
                                  </span>
                                )}
                                {!isTopProfit && !isTopVolume && item.marginPercent >= 50 && (
                                  <span className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 border border-indigo-500/30 px-2 py-1 text-[9px] font-bold uppercase">
                                    💎 {lang === 'ar' ? 'هامش ممتاز' : 'HIGH MARGIN'}
                                  </span>
                                )}
                                {!isTopProfit && !isTopVolume && item.marginPercent < 50 && item.marginPercent >= 30 && (
                                  <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-white/70 border border-black/10 dark:border-white/10 px-2 py-1 text-[9px] font-bold uppercase">
                                    ⚡ {lang === 'ar' ? 'مستقر' : 'STABLE'}
                                  </span>
                                )}
                                {!isTopProfit && !isTopVolume && item.marginPercent < 30 && (
                                  <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-600 border border-rose-500/30 px-2 py-1 text-[9px] font-bold uppercase">
                                    📈 {lang === 'ar' ? 'يحتاج رفع السعر' : 'LOW MARGIN'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Order Status Distribution & Category Sales */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Orders Breakdown by Status */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <PieChart size={16} className="text-amber-500" />
                      <h3 className="text-xs luxury-tracking uppercase font-bold text-zinc-800 dark:text-white">ORDER STATUS DISTRIBUTION (توزيع حالات الطلبات)</h3>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{orders.length} TOTAL ORDERS</span>
                  </div>

                  <div className="flex flex-col gap-5 text-xs luxury-tracking">
                    {/* Progress Bar overall */}
                    <div className="h-4 w-full bg-zinc-100 dark:bg-white/10 flex overflow-hidden border border-black/10 dark:border-white/10">
                      <div style={{ width: `${orders.length > 0 ? (completedOrders.length / orders.length) * 100 : 0}%` }} className="bg-emerald-500 h-full transition-all duration-500" title="Completed" />
                      <div style={{ width: `${orders.length > 0 ? (processingOrders.length / orders.length) * 100 : 0}%` }} className="bg-blue-500 h-full transition-all duration-500" title="Processing" />
                      <div style={{ width: `${orders.length > 0 ? (pendingOrders.length / orders.length) * 100 : 0}%` }} className="bg-amber-500 h-full transition-all duration-500" title="Pending" />
                      <div style={{ width: `${orders.length > 0 ? (cancelledOrders.length / orders.length) * 100 : 0}%` }} className="bg-rose-500 h-full transition-all duration-500" title="Cancelled" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle size={12} /> COMPLETED ({completedOrders.length})</span>
                        <span className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
                          {orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 0}%
                        </span>
                      </div>

                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1"><Clock size={12} /> PROCESSING ({processingOrders.length})</span>
                        <span className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
                          {orders.length > 0 ? Math.round((processingOrders.length / orders.length) * 100) : 0}%
                        </span>
                      </div>

                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1"><Clock size={12} /> PENDING ({pendingOrders.length})</span>
                        <span className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
                          {orders.length > 0 ? Math.round((pendingOrders.length / orders.length) * 100) : 0}%
                        </span>
                      </div>

                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1"><Ban size={12} /> CANCELLED ({cancelledOrders.length})</span>
                        <span className="font-mono text-lg font-bold text-zinc-900 dark:text-white">
                          {orders.length > 0 ? Math.round((cancelledOrders.length / orders.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Revenue Performance */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <BarChart2 size={16} className="text-amber-500" />
                      <h3 className="text-xs luxury-tracking uppercase font-bold text-zinc-800 dark:text-white">CATEGORY SALES & REVENUE (مبيادات الأقسام)</h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 text-xs luxury-tracking">
                    {['TOPS', 'BOTTOMS', 'OUTERWEAR'].map(cat => {
                      const amount = categorySalesMap[cat] || 0;
                      const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                      return (
                        <div key={cat} className="flex flex-col gap-1.5 p-3 bg-zinc-50 dark:bg-[#050505] border border-black/5 dark:border-white/5">
                          <div className="flex justify-between text-xs font-bold">
                            <span>{cat}</span>
                            <span className="font-mono text-amber-600">{amount.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'} ({percentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-200 dark:bg-white/10 overflow-hidden rounded-full">
                            <div style={{ width: `${percentage}%` }} className="h-full bg-amber-500 transition-all duration-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center bg-white dark:bg-[#0A0A0A] p-6 border border-black/10 dark:border-white/5">
                <div>
                  <h3 className="text-sm luxury-tracking font-bold uppercase text-zinc-900 dark:text-white">CUSTOMER ORDERS</h3>
                  <p className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 uppercase mt-1 font-medium">All real orders submitted by site visitors</p>
                </div>
                <span className="text-xs luxury-tracking font-mono font-bold bg-zinc-100 dark:bg-white/10 px-3 py-1 text-zinc-800 dark:text-white">TOTAL: {orders.length}</span>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white p-16 border border-black/10 dark:border-white/5 text-center flex flex-col items-center gap-4">
                  <Package size={36} className="text-zinc-400 dark:text-white/30" />
                  <p className="text-xs luxury-tracking uppercase text-zinc-500 dark:text-white/50">NO CUSTOMER ORDERS RECORDED IN DATABASE YET.</p>
                  <p className="text-[10px] luxury-tracking text-zinc-400 dark:text-white/30 max-w-md">When a customer adds items to bag and completes checkout, their order data, phone number, and address will be saved here in real-time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {orders.map((ord, idx) => (
                    <div key={`${ord.id}-${idx}`} className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 shadow-sm p-6 flex flex-col gap-6">
                      <div className="flex flex-wrap justify-between items-start border-b border-black/10 dark:border-white/10 pb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">#{ord.id}</span>
                            <span className={`text-[9px] luxury-tracking uppercase font-bold px-2.5 py-0.5 border ${
                              ord.status === 'COMPLETED' || ord.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                              ord.status === 'CANCELLED' || ord.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' :
                              'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            }`}>
                              {ord.status}
                            </span>
                          </div>
                          <span className="text-[9px] luxury-tracking text-zinc-400 dark:text-white/40 block mt-1 flex items-center gap-1 font-medium">
                            <Calendar size={10} /> {new Date(ord.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 uppercase font-medium">STATUS:</span>
                            <select 
                              value={ord.status} 
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                              className="bg-zinc-100 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-1 text-[10px] luxury-tracking text-zinc-900 dark:text-white focus:outline-none uppercase font-bold"
                            >
                              <option value="PENDING" className="bg-white text-black dark:bg-[#0A0A0A] dark:text-white">PENDING</option>
                              <option value="PROCESSING" className="bg-white text-black dark:bg-[#0A0A0A] dark:text-white">PROCESSING</option>
                              <option value="COMPLETED" className="bg-white text-black dark:bg-[#0A0A0A] dark:text-white">COMPLETED</option>
                              <option value="CANCELLED" className="bg-white text-black dark:bg-[#0A0A0A] dark:text-white">CANCELLED</option>
                            </select>
                          </div>
                          
                          <button onClick={() => setDeleteTarget({ type: 'order', idOrIndex: ord.id, name: `الطلب #${ord.id} - ${ord.customerName}` })} className="p-2 text-rose-500 hover:text-rose-700 dark:text-red-500/60 dark:hover:text-red-500 transition-colors" title="Delete Order">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-[11px] luxury-tracking bg-zinc-50 dark:bg-[#050505] p-4 border border-black/5 dark:border-white/5">
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-400 dark:text-white/40 text-[9px] uppercase font-semibold">
                            {lang === 'ar' ? 'اسم العميل' : 'CUSTOMER NAME'}
                          </span>
                          <span className="font-bold text-zinc-900 dark:text-white">{ord.customerName}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-400 dark:text-white/40 text-[9px] uppercase font-semibold flex items-center justify-between">
                            <span>{lang === 'ar' ? 'رقم الهاتف' : 'PHONE NUMBER'}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                              <Phone size={12} className="text-amber-500" /> {ord.customerPhone}
                            </span>
                            <a
                              href={`https://wa.me/20${ord.customerPhone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                                `مرحباً ${ord.customerName} 👋\nشكراً لطلبك من AVENTO7! 🛍️\n\n` +
                                `📋 *رقم الطلب:* #${ord.id}\n` +
                                `💰 *الإجمالي النهائي:* ${ord.totalAmount.toLocaleString()} ج.م\n` +
                                `📍 *عنوان الشحن:* ${ord.governorate} - ${ord.address}\n` +
                                `🚚 *حالة الطلب:* ${ord.status}\n\n` +
                                `سنقوم بإبلاغك بجميع تحديثات الشحن والتوصيل. شكراً لك!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] uppercase rounded-xs transition-colors flex items-center gap-1 shadow-xs"
                              title="Send WhatsApp Invoice"
                            >
                              <MessageCircle size={10} />
                              <span>{lang === 'ar' ? 'فاتورة واتساب' : 'WA'}</span>
                            </a>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-400 dark:text-white/40 text-[9px] uppercase font-semibold">
                            {lang === 'ar' ? 'المحافظة وسعر الشحن' : 'GOVERNORATE & SHIPPING'}
                          </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Truck size={12} /> {ord.governorate || 'القاهرة'} ({ord.shippingFee !== undefined ? `${ord.shippingFee} ${lang === 'ar' ? 'ج.م' : 'EGP'}` : 'مجاني'})
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-zinc-400 dark:text-white/40 text-[9px] uppercase font-semibold">
                            {lang === 'ar' ? 'عنوان التسليم' : 'DELIVERY ADDRESS'}
                          </span>
                          <span className="font-medium text-zinc-800 dark:text-white/80 flex items-start gap-1">
                            <MapPin size={12} className="shrink-0 mt-0.5 text-zinc-400" /> {ord.address}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 font-bold uppercase">ORDERED ITEMS:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-zinc-50 dark:bg-[#050505] p-2 border border-black/5 dark:border-white/5">
                              <img src={item.image} alt={item.name} className="w-12 h-14 object-cover" />
                              <div className="flex flex-col text-[10px] luxury-tracking">
                                <span className="font-bold text-zinc-900 dark:text-white line-clamp-1">{item.name}</span>
                                <span className="text-zinc-500 dark:text-white/50">SIZE: {item.size} | QTY: {item.quantity}</span>
                                <span className="font-mono text-zinc-800 dark:text-white/80 font-bold">{(item.price * item.quantity).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end border-t border-black/10 dark:border-white/10 pt-4 text-[11px] luxury-tracking">
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-500 dark:text-white/50 font-medium">TOTAL AMOUNT PAID / COD:</span>
                          <span className="text-lg font-mono font-bold text-zinc-900 dark:text-white">{ord.totalAmount.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGISTERED USERS */}
          {activeTab === 'users' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-white dark:bg-[#0A0A0A] p-6 border border-black/10 dark:border-white/5">
                  <div>
                    <h3 className="text-sm luxury-tracking font-bold uppercase text-zinc-900 dark:text-white">{lang === 'ar' ? 'العملاء المسجلون' : 'REGISTERED CUSTOMERS'}</h3>
                    <p className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 uppercase mt-1 font-medium">{lang === 'ar' ? 'حسابات حقيقية مسجلة بأرقام هواتف' : 'Real registered accounts saved with phone numbers'}</p>
                  </div>
                  <span className="text-xs luxury-tracking font-mono font-bold bg-zinc-100 dark:bg-white/10 px-3 py-1 text-zinc-800 dark:text-white">TOTAL: {registeredUsers.length}</span>
                </div>
                
                <div className="flex gap-4 border-b border-black/10 dark:border-white/10">
                  <button 
                    onClick={() => setUserFilter('active')}
                    className={`pb-2 text-[10px] luxury-tracking uppercase font-bold transition-colors ${userFilter === 'active' ? 'text-zinc-900 dark:text-white border-b-2 border-black dark:border-white' : 'text-zinc-400 hover:text-black dark:text-white/40 dark:hover:text-white'}`}
                  >
                    {lang === 'ar' ? 'العملاء النشطون' : 'ACTIVE USERS'} ({registeredUsers.filter(u => !u.isArchived).length})
                  </button>
                  <button 
                    onClick={() => setUserFilter('archived')}
                    className={`pb-2 text-[10px] luxury-tracking uppercase font-bold transition-colors ${userFilter === 'archived' ? 'text-rose-600 border-b-2 border-rose-600' : 'text-zinc-400 hover:text-rose-600 dark:text-white/40 dark:hover:text-rose-400'}`}
                  >
                    {lang === 'ar' ? 'العملاء المحظورون / الأرشيف' : 'BANNED / ARCHIVED'} ({registeredUsers.filter(u => u.isArchived).length})
                  </button>
                </div>

                {/* Customer Search Bar */}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={lang === 'ar' ? 'البحث عن عميل (بالاسم، البريد، رقم الهاتف، المحافظة...)' : 'Search customer by name, email, phone, governorate...'}
                    className="w-full bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 pl-10 pr-10 rtl:pl-10 rtl:pr-10 py-3 text-xs luxury-tracking font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-amber-400 transition-colors rounded-lg shadow-sm"
                  />
                  {userSearch && (
                    <button
                      onClick={() => setUserSearch('')}
                      className="absolute right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1"
                      title={lang === 'ar' ? 'مسح البحث' : 'Clear search'}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const filteredUsersList = registeredUsers.filter(u => {
                  const matchesTab = userFilter === 'archived' ? u.isArchived : !u.isArchived;
                  if (!matchesTab) return false;
                  if (!userSearch.trim()) return true;

                  const query = userSearch.toLowerCase().trim();
                  const nameMatch = (u.name || '').toLowerCase().includes(query);
                  const emailMatch = (u.email || '').toLowerCase().includes(query);
                  const phoneDigits = (u.phone || '').replace(/\D/g, '');
                  const queryDigits = query.replace(/\D/g, '');
                  const phoneMatch = (phoneDigits && queryDigits && phoneDigits.includes(queryDigits)) || (u.phone || '').toLowerCase().includes(query);
                  const govMatch = (u.governorate || '').toLowerCase().includes(query);
                  const idMatch = (u.id || '').toLowerCase().includes(query);

                  return nameMatch || emailMatch || phoneMatch || govMatch || idMatch;
                });

                if (filteredUsersList.length === 0) {
                  return (
                    <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white p-16 border border-black/10 dark:border-white/5 text-center flex flex-col items-center gap-4 rounded-xl">
                      <Users size={36} className="text-zinc-400 dark:text-white/30" />
                      <p className="text-xs luxury-tracking uppercase text-zinc-500 dark:text-white/50">
                        {userSearch.trim() 
                          ? (lang === 'ar' ? `لم يتم العثور على أي نتائج تطابق "${userSearch}"` : `NO RESULTS FOUND FOR "${userSearch}"`)
                          : (lang === 'ar' ? 'لا يوجد عملاء في هذا القسم' : 'NO CUSTOMERS IN THIS SECTION YET.')
                        }
                      </p>
                      {userSearch.trim() && (
                        <button
                          onClick={() => setUserSearch('')}
                          className="px-4 py-2 bg-zinc-100 dark:bg-white/10 text-xs font-bold uppercase luxury-tracking hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors rounded-lg"
                        >
                          {lang === 'ar' ? 'إلغاء تصفية البحث' : 'CLEAR SEARCH FILTER'}
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 shadow-sm overflow-x-auto rounded-xl">
                    <table className="w-full text-left rtl:text-right text-[11px] luxury-tracking">
                      <thead className="bg-zinc-100 dark:bg-[#050505] text-zinc-500 dark:text-white/50 uppercase font-semibold border-b border-black/10 dark:border-white/10">
                        <tr>
                          <th className="p-4">{lang === 'ar' ? 'العميل' : 'CUSTOMER'}</th>
                          <th className="p-4">{lang === 'ar' ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}</th>
                          <th className="p-4">{lang === 'ar' ? 'رقم الهاتف' : 'PHONE NUMBER'}</th>
                          <th className="p-4">{lang === 'ar' ? 'المحافظة' : 'GOVERNORATE'}</th>
                          <th className="p-4">{lang === 'ar' ? 'إجمالي المشتريات' : 'ORDERS & SPEND'}</th>
                          <th className="p-4">{lang === 'ar' ? 'تاريخ التسجيل' : 'REGISTERED DATE'}</th>
                          <th className="p-4">{lang === 'ar' ? 'الإجراءات' : 'ACTIONS'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                        {filteredUsersList.map((usr, idx) => {
                        const userOrders = orders.filter(o => 
                          (usr.email && o.customerEmail?.toLowerCase() === usr.email.toLowerCase()) || 
                          (usr.phone && o.customerPhone?.includes(usr.phone.replace(/\D/g, '').slice(-8)))
                        );
                        const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                        const userGov = usr.governorate || userOrders[0]?.governorate || 'القاهرة';
                        const cleanPhone = usr.phone || userOrders[0]?.customerPhone || '';

                        return (
                          <tr key={`${usr.id}-${idx}`} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-zinc-900 dark:text-white">{usr.name || 'عميل مسجل'}</span>
                                <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase">ID: #{usr.id.slice(-6)}</span>
                              </div>
                            </td>
                            <td className="p-4 text-zinc-600 dark:text-white/70 font-mono">{usr.email}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  <Phone size={12} className="shrink-0 text-amber-500" />
                                  <span dir="ltr">{cleanPhone || 'N/A'}</span>
                                </span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/20${cleanPhone.replace(/\D/g, '').replace(/^0/, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[9px] font-bold uppercase transition-colors flex items-center gap-1 shrink-0"
                                    title="WhatsApp"
                                  >
                                    <MessageCircle size={11} />
                                    <span>{lang === 'ar' ? 'واتساب' : 'WA'}</span>
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-zinc-800 dark:text-white/90 flex items-center gap-1">
                                <MapPin size={12} className="text-amber-500 shrink-0" />
                                {userGov}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                                  {totalSpent.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                                </span>
                                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-semibold">
                                  {userOrders.length} {lang === 'ar' ? 'طلبات مسجلة' : 'ORDERS'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-zinc-500 dark:text-white/60 font-mono text-[10px]">
                              <span dir="ltr" className="inline-block bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded text-[#30001A] dark:text-rose-200 border border-black/5 dark:border-white/5 font-bold">
                                {formatDateSafely(usr.createdAt)}
                              </span>
                            </td>
                            <td className="p-4">
                              {userFilter === 'active' ? (
                                <button onClick={() => handleToggleUserArchive(usr.id)} className="text-amber-600 hover:text-amber-700 dark:text-amber-500/80 dark:hover:text-amber-400 p-1 flex items-center gap-1" title={lang === 'ar' ? 'حظر / نقل للأرشيف' : 'Ban / Archive User'}>
                                  <UserX size={14} /> <span className="text-[9px] uppercase">{lang === 'ar' ? 'حظر' : 'Archive'}</span>
                                </button>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <button onClick={() => handleToggleUserArchive(usr.id)} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-500/80 dark:hover:text-emerald-400 p-1 flex items-center gap-1" title={lang === 'ar' ? 'استعادة الحساب' : 'Restore User'}>
                                    <UserCheck size={14} /> <span className="text-[9px] uppercase">{lang === 'ar' ? 'استعادة' : 'Restore'}</span>
                                  </button>
                                  <button onClick={() => setDeleteTarget({ type: 'user', idOrIndex: usr.id, name: `حساب العميل: ${usr.name || 'مستخدم'} (${usr.email})` })} className="text-rose-500 hover:text-rose-700 dark:text-red-500/60 dark:hover:text-red-500 p-1 flex items-center gap-1" title="Permanent Delete">
                                    <Trash2 size={14} /> <span className="text-[9px] uppercase">{lang === 'ar' ? 'حذف نهائي' : 'Delete'}</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            </div>
          )}

          {/* TAB 4: PRODUCTS CATALOG MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="flex flex-col gap-6 w-full min-w-0">
              {/* Header Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-black/10 dark:border-white/10">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                      <Boxes size={22} className="text-amber-500" />
                      {lang === 'ar' ? 'إدارة كتالوج المنتجات' : 'PRODUCTS CATALOG MANAGEMENT'}
                    </h2>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {products.length} {lang === 'ar' ? 'منتج' : 'PRODUCTS'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {lang === 'ar' ? 'إدارة كتالوج المنتجات، الأسعار، التكاليف، الأرباح والمخزون بأسلوب Shopify Admin' : 'Shopify-style catalog management for pricing, margins, inventory, and visibility'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      resetForm();
                      setIsProductModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all font-bold text-xs uppercase shadow-md cursor-pointer group"
                  >
                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                    <span>{lang === 'ar' ? 'إضافة منتج جديد' : 'ADD NEW PRODUCT'}</span>
                  </button>
                </div>
              </div>

              {/* SAAS MANAGEMENT TOOLBAR (Search, Filters, Sort & Bulk Actions) */}
              <div className="flex flex-col gap-3 bg-white dark:bg-[#0d060b] p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                  
                  {/* Search Bar (Cols 4) */}
                  <div className="relative sm:col-span-2 lg:col-span-4">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={lang === 'ar' ? 'بحث باسم المنتج أو SKU أو التصنيف...' : 'Search by name, SKU, category...'}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    {productSearch && (
                      <button onClick={() => setProductSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Category Filter (Cols 3) */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {['ALL', 'TOPS', 'BOTTOMS', 'OUTERWEAR'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setProductCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                            productCategoryFilter === cat
                              ? 'bg-amber-500 text-black shadow-xs font-black'
                              : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {cat === 'ALL' ? (lang === 'ar' ? 'الكل' : 'ALL') : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter Dropdown (Cols 3) */}
                  <div className="lg:col-span-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 shrink-0 hidden sm:inline">
                      {lang === 'ar' ? 'الحالة:' : 'Status:'}
                    </span>
                    <select
                      value={productStatusFilter}
                      onChange={(e) => setProductStatusFilter(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="ALL">{lang === 'ar' ? 'جميع الحالات (All Statuses)' : 'All Statuses'}</option>
                      <option value="IN_STOCK">{lang === 'ar' ? 'متوفر (In Stock)' : 'In Stock'}</option>
                      <option value="LOW_STOCK">{lang === 'ar' ? 'مخزون منخفض (Low Stock)' : 'Low Stock'}</option>
                      <option value="OUT_OF_STOCK">{lang === 'ar' ? 'نفد المخزون (Out of Stock)' : 'Out of Stock'}</option>
                      <option value="PUBLISHED">{lang === 'ar' ? 'منشور (Published)' : 'Published'}</option>
                      <option value="DRAFT">{lang === 'ar' ? 'مسودة / أراشيف (Draft)' : 'Draft / Archived'}</option>
                    </select>
                  </div>

                  {/* Sort Dropdown (Cols 2) */}
                  <div className="lg:col-span-2">
                    <select
                      value={productSort}
                      onChange={(e) => setProductSort(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="newest">{lang === 'ar' ? 'الأحدث أولاً' : 'Newest'}</option>
                      <option value="price-high">{lang === 'ar' ? 'السعر: الأعلى' : 'Price: High to Low'}</option>
                      <option value="price-low">{lang === 'ar' ? 'السعر: الأقل' : 'Price: Low to High'}</option>
                      <option value="profit-high">{lang === 'ar' ? 'الربح: الأعلى' : 'Profit: Highest'}</option>
                      <option value="stock-low">{lang === 'ar' ? 'المخزون: الأقل' : 'Stock: Lowest'}</option>
                      <option value="name-asc">{lang === 'ar' ? 'الاسم: أ - ي' : 'Name: A-Z'}</option>
                    </select>
                  </div>

                </div>

                {/* Bulk Actions Bar (Appears when products are selected) */}
                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSelectAllProducts(filteredAndSortedProducts.map(p => p.id))}
                      className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white font-bold cursor-pointer"
                    >
                      {selectedProductIds.length > 0 && selectedProductIds.length === filteredAndSortedProducts.length ? (
                        <CheckSquare size={16} className="text-amber-500" />
                      ) : (
                        <Square size={16} className="text-zinc-400" />
                      )}
                      <span>
                        {selectedProductIds.length > 0
                          ? (lang === 'ar' ? `تم تحديد ${selectedProductIds.length}` : `${selectedProductIds.length} Selected`)
                          : (lang === 'ar' ? 'تحديد الكل' : 'Select All')}
                      </span>
                    </button>
                  </div>

                  {selectedProductIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-fadeIn">
                      <span className="text-[10px] font-bold text-amber-500 uppercase mr-1">
                        {lang === 'ar' ? 'إجراءات جماعية:' : 'Bulk Actions:'}
                      </span>
                      <button
                        onClick={handleBulkPublish}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 cursor-pointer"
                      >
                        {lang === 'ar' ? 'نشر المحدد' : 'Publish'}
                      </button>
                      <button
                        onClick={handleBulkArchive}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 border border-black/10 dark:border-white/10 cursor-pointer"
                      >
                        {lang === 'ar' ? 'حفظ كمسودة' : 'Draft'}
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 cursor-pointer"
                      >
                        {lang === 'ar' ? 'حذف المحدد' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SHOPIFY-STYLE COMPACT MANAGEMENT CARDS GRID */}
              {filteredAndSortedProducts.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center bg-white dark:bg-[#0d060b] rounded-2xl border border-dashed border-black/10 dark:border-white/10 p-8 shadow-xs">
                  <Package size={48} className="text-zinc-400 dark:text-white/30 mb-3" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-white/70">
                    {lang === 'ar' ? 'لا توجد منتجات مطابقة للفلترة' : 'NO PRODUCTS MATCHING FILTERS'}
                  </h3>
                  <p className="text-xs text-zinc-400 dark:text-white/40 mt-1 max-w-sm">
                    {lang === 'ar' ? 'إعادة ضبط خيارات البحث والتصنيف لعرض المنتجات' : 'Try clearing search or filters to see catalog products.'}
                  </p>
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 ${
                  isSidebarCollapsed ? 'xl:grid-cols-3 2xl:grid-cols-4' : 'xl:grid-cols-3'
                } gap-5 sm:gap-6 w-full`}>
                  {filteredAndSortedProducts.map((p, idx) => {
                    const pCost = p.costPrice && p.costPrice > 0 ? p.costPrice : Math.round(p.price * 0.55);
                    const pProfit = p.price - pCost;
                    const pMargin = Math.round((pProfit / p.price) * 100);
                    const pStock = p.stock ?? 24;
                    const pSku = p.sku || `SKU-A7-${p.id.slice(0, 6).toUpperCase()}`;
                    const pVisibility = p.visibility || 'Published';
                    const isSelected = selectedProductIds.includes(p.id);
                    const lastUpdatedText = p.lastUpdated || 'Aug 03, 2026';

                    return (
                      <div 
                        key={`${p.id}-${idx}`} 
                        className={`bg-white dark:bg-[#0d060b] text-zinc-900 dark:text-white border ${
                          isSelected 
                            ? 'border-amber-500 ring-2 ring-amber-500/30' 
                            : 'border-black/10 dark:border-white/10 hover:border-amber-500/40'
                        } rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full gap-4 group relative`}
                      >
                        {/* Top Metadata Row: Selection, Status & Visibility */}
                        <div className="flex items-center justify-between gap-2 border-b border-black/5 dark:border-white/5 pb-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => toggleSelectProduct(p.id)}
                              className="text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                              title={isSelected ? "Unselect" : "Select"}
                            >
                              {isSelected ? (
                                <CheckSquare size={18} className="text-amber-500" />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>

                            {/* Visibility Badge */}
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                              pVisibility === 'Published'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-zinc-100 dark:bg-white/10 text-zinc-500 border-black/10 dark:border-white/10'
                            }`}>
                              {pVisibility}
                            </span>
                          </div>

                          {/* Stock Status Badge */}
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className={`w-2 h-2 rounded-full ${
                              pStock > 10 ? 'bg-emerald-500' : pStock > 0 ? 'bg-amber-500' : 'bg-rose-500'
                            }`} />
                            <span className="font-bold text-zinc-700 dark:text-zinc-300">
                              {pStock > 10 ? (lang === 'ar' ? 'متوفر' : 'In Stock') : pStock > 0 ? (lang === 'ar' ? 'مخزون قليل' : 'Low Stock') : (lang === 'ar' ? 'نفد' : 'Out of Stock')} ({pStock})
                            </span>
                          </div>
                        </div>

                        {/* Product Identifiers & Thumbnail Area */}
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {/* Image Thumbnail */}
                          <div className="relative w-full sm:w-28 h-36 sm:h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/10 shrink-0">
                            <img 
                              src={p.image} 
                              alt={p.name}
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {p.isNew && (
                              <span className="absolute top-1.5 left-1.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-500 text-black rounded-md shadow-xs">
                                NEW
                              </span>
                            )}
                          </div>

                          {/* Info Column */}
                          <div className="flex flex-col gap-1.5 min-w-0 flex-1 w-full">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                #{pSku}
                              </span>
                              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                                {lastUpdatedText}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                              {p.name}
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300">
                                {p.category}
                              </span>
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-zinc-500">
                                {p.gender}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Financial Metrics Box (Selling Price, Cost, Net Profit & Margin) */}
                        <div className="bg-zinc-50 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase font-sans text-zinc-400 font-medium">
                                {lang === 'ar' ? 'سعر البيع' : 'Selling Price'}
                              </span>
                              <span className="font-extrabold text-zinc-900 dark:text-white">
                                {p.price.toLocaleString()} <span className="text-[10px] text-zinc-400 font-sans">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                              </span>
                            </div>

                            <div className="flex flex-col text-right">
                              <span className="text-[9px] uppercase font-sans text-zinc-400 font-medium">
                                {lang === 'ar' ? 'التكلفة' : 'Cost Price'}
                              </span>
                              <span className="text-zinc-500 font-bold">
                                {pCost.toLocaleString()} <span className="text-[10px] font-sans">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="text-[9px] uppercase font-sans text-zinc-500 font-normal">
                              {lang === 'ar' ? 'صافي الربح:' : 'Net Profit:'}
                            </span>
                            <span>
                              +{pProfit.toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'} ({pMargin}%)
                            </span>
                          </div>
                        </div>

                        {/* Sold Out Switch Control Bar */}
                        {(() => {
                          const pendingForProd = notificationsList.filter(n => n.productId === p.id && !n.notified).length;
                          return (
                            <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                              p.isSoldOut 
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300' 
                                : 'bg-zinc-50 dark:bg-white/5 border-black/5 dark:border-white/5 text-zinc-700 dark:text-zinc-300'
                            }`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${p.isSoldOut ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[10px] font-bold uppercase truncate">
                                    {p.isSoldOut ? (lang === 'ar' ? 'نفذت الكمية (Sold Out)' : 'Sold Out') : (lang === 'ar' ? 'متاح للبيع' : 'Available')}
                                  </span>
                                  {pendingForProd > 0 && (
                                    <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                      <Bell size={10} className="animate-bounce" /> {pendingForProd} {lang === 'ar' ? 'عملاء بانتظار التوفر' : 'Waiting for restock'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={async () => {
                                  const newSoldOut = !p.isSoldOut;
                                  onUpdateProduct({ 
                                    ...p, 
                                    isSoldOut: newSoldOut,
                                    status: newSoldOut ? 'Out of Stock' : ((p.stock ?? 24) > 10 ? 'In Stock' : 'Low Stock')
                                  });

                                  // If toggling from Sold Out -> In Stock, trigger notifications!
                                  if (!newSoldOut) {
                                    const count = await triggerNotificationsForProduct(p.id, p.nameAr || p.name);
                                    if (count > 0) {
                                      setRestockAlertToast({
                                        productName: p.nameAr || p.name,
                                        count
                                      });
                                      setTimeout(() => setRestockAlertToast(null), 6000);
                                    }
                                  }
                                }}
                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                                  p.isSoldOut ? 'bg-rose-600' : 'bg-zinc-300 dark:bg-zinc-700'
                                }`}
                                title={p.isSoldOut ? (lang === 'ar' ? 'اضغط لتعيين المنتج كمتوفر وإرسال إشعارات للعملاء' : 'Click to Mark Available & Trigger Notifications') : (lang === 'ar' ? 'اضغط لتعيين المنتج كـ نفذت الكمية' : 'Click to Mark Sold Out')}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    p.isSoldOut ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })()}

                        {/* Card Action Footer (Shopify SaaS Controls) */}
                        <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1 text-xs">
                          {/* Primary Edit Button */}
                          <button
                            onClick={() => handleEditClick(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
                          >
                            <Edit2 size={12} />
                            <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                          </button>

                          {/* Quick Secondary Actions */}
                          <div className="flex items-center gap-1 text-zinc-500">
                            <button
                              onClick={() => setQuickViewProduct(p)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'معاينة سريعة' : 'Quick View'}
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => handleDuplicateProduct(p)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'تكرار المنتج' : 'Duplicate'}
                            >
                              <Copy size={15} />
                            </button>

                            <button
                              onClick={() => handleToggleVisibility(p)}
                              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'تغيير الحالة (مسودة/منشور)' : 'Toggle Draft/Published'}
                            >
                              <Archive size={15} />
                            </button>

                            <button
                              onClick={() => setDeleteTarget({ type: 'product', idOrIndex: p.id, name: `المنتج: "${p.name}"` })}
                              className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'حذف المنتج' : 'Delete'}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STOREFRONT */}
          {activeTab === 'storefront' && (
            <div className="flex flex-col lg:flex-row gap-12 items-start text-[10px] luxury-tracking">
              
              {/* Marquee Settings */}
              <div className="w-full lg:w-1/2 flex flex-col gap-8">
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 shadow-sm p-8 flex flex-col gap-6">
                  <h3 className="text-xs uppercase text-zinc-800 dark:text-white/80 border-b border-black/10 dark:border-white/10 pb-4 font-bold">ACTIVE OFFERS (MARQUEE)</h3>
                  
                  <div className="flex flex-col gap-4">
                    {settings.offers.map((offer, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-50 dark:bg-white/5 p-4 border border-black/5 dark:border-white/5 group">
                        <span className="uppercase text-zinc-900 dark:text-white truncate max-w-[80%] font-medium">{offer}</span>
                        <button onClick={() => setDeleteTarget({ type: 'offer', idOrIndex: idx, name: `العرض الإعلاني: "${offer}"` })} className="text-rose-500 hover:text-rose-700 dark:text-red-500/50 dark:hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {settings.offers.length === 0 && <span className="text-zinc-400 dark:text-white/30 p-4 text-center">NO OFFERS ACTIVE</span>}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <input 
                      type="text" 
                      value={newOffer}
                      onChange={(e) => setNewOffer(e.target.value)}
                      placeholder="NEW OFFER TEXT..." 
                      className="flex-1 bg-transparent border-b border-black/20 dark:border-white/20 pb-2 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#86868b] focus:outline-none focus:border-black dark:focus:border-white uppercase font-medium"
                    />
                    <button onClick={handleAddOffer} className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 uppercase font-bold hover:bg-zinc-800 dark:hover:bg-white/80 transition-colors">
                      ADD
                    </button>
                  </div>
                </div>
              </div>

              {/* Hero Slider Settings */}
              <div className="w-full lg:w-1/2 flex flex-col gap-8">
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 shadow-sm p-8 flex flex-col gap-6">
                  <h3 className="text-xs uppercase text-zinc-800 dark:text-white/80 border-b border-black/10 dark:border-white/10 pb-4 font-bold">HERO SLIDER IMAGES</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {settings.heroImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-[4/3] group border border-black/10 dark:border-white/5">
                        <img src={img} alt={`Hero ${idx}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                          <button onClick={() => setDeleteTarget({ type: 'image', idOrIndex: idx, name: `صورة الهيرو رقم ${idx + 1}` })} className="bg-rose-600 text-white p-3 rounded-full hover:bg-rose-700 transition-colors shadow-xl">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload from Device Button for Hero Slider */}
                  <div className="flex flex-col gap-3 pt-2 border-t border-black/10 dark:border-white/10">
                    <label className="cursor-pointer flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-center group font-bold text-amber-600 dark:text-amber-400 text-xs">
                      <Upload size={16} className="group-hover:scale-110 transition-transform" />
                      <span>{lang === 'ar' ? 'رفع صورة جديدة للهيرو من الجهاز' : 'UPLOAD NEW HERO IMAGE FROM DEVICE'}</span>
                      <input type="file" accept="image/*" onChange={handleHeroImageFileUpload} className="hidden" />
                    </label>

                    {/* Or URL input */}
                    <div className="flex gap-2 items-center">
                      <input 
                        type="url" 
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder={lang === 'ar' ? 'أو ضع رابط صورة مباشر هنا...' : 'OR PASTE IMAGE URL...'} 
                        className="flex-1 bg-transparent border-b border-black/20 dark:border-white/20 pb-2 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none focus:border-amber-500"
                      />
                      <button onClick={handleAddImage} className="bg-black text-white dark:bg-white dark:text-black px-5 py-2 uppercase font-bold hover:bg-zinc-800 dark:hover:bg-white/80 transition-colors text-xs">
                        {lang === 'ar' ? 'إضافة' : 'ADD'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Social Media Links Card */}
                <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 shadow-sm p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                    <h3 className="text-xs uppercase text-zinc-800 dark:text-white/80 font-bold flex items-center gap-2">
                      <Share2 size={16} className="text-amber-500" />
                      <span>{lang === 'ar' ? 'روابط مواقع التواصل الاجتماعي (الفواتر)' : 'SOCIAL MEDIA LINKS (FOOTER)'}</span>
                    </h3>
                  </div>

                  {socialSavedSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-xs uppercase"
                    >
                      <CheckCircle size={16} />
                      <span>{lang === 'ar' ? 'تم حفظ روابط التواصل الاجتماعي بنجاح!' : 'SOCIAL LINKS SAVED SUCCESSFULLY!'}</span>
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-4">
                    {/* Facebook Link */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase flex items-center gap-2">
                        <Facebook size={14} className="text-blue-600" />
                        <span>{lang === 'ar' ? 'رابط صفحة فيسبوك:' : 'FACEBOOK URL:'}</span>
                      </label>
                      <input 
                        type="url"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/your-page"
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Instagram Link */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase flex items-center gap-2">
                        <Instagram size={14} className="text-pink-600" />
                        <span>{lang === 'ar' ? 'رابط حساب انستغرام:' : 'INSTAGRAM URL:'}</span>
                      </label>
                      <input 
                        type="url"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/your-profile"
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* TikTok Link */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase flex items-center gap-2">
                        <TikTokIcon className="w-3.5 h-3.5 text-zinc-900 dark:text-white" />
                        <span>{lang === 'ar' ? 'رابط حساب تيك توك:' : 'TIKTOK URL:'}</span>
                      </label>
                      <input 
                        type="url"
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        placeholder="https://tiktok.com/@your-handle"
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button 
                      onClick={handleSaveSocialLinks}
                      className="mt-2 bg-amber-500 text-black px-6 py-3 uppercase font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 text-xs shadow-sm cursor-pointer"
                    >
                      <Check size={16} />
                      <span>{lang === 'ar' ? 'حفظ روابط التواصل' : 'SAVE SOCIAL LINKS'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: SHIPPING RATES & GOVERNORATES */}
          {activeTab === 'shipping' && (
            <div className="flex flex-col gap-8 text-[10px] luxury-tracking">
              
              {/* Toast Success Message */}
              {shippingSavedSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-3 text-xs uppercase shadow-md"
                >
                  <CheckCircle size={18} />
                  <span>{lang === 'ar' ? 'تم حفظ أسعار الشحن لجميع المحافظات بنجاح!' : 'SHIPPING RATES SAVED SUCCESSFULLY FOR ALL GOVERNORATES!'}</span>
                </motion.div>
              )}

              {/* Header Box */}
              <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Truck size={28} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                      {lang === 'ar' ? 'جدول أسعار الشحن للمحافظات المصرية (27 محافظة)' : 'EGYPT GOVERNORATES SHIPPING RATES (27 GOVERNORATES)'}
                    </h2>
                    <p className="text-zinc-500 dark:text-white/50 text-[11px] normal-case mt-1 max-w-2xl font-normal leading-relaxed">
                      {lang === 'ar' 
                        ? 'حدد تكلفة الشحن الخاصة بكل محافظة. عندما يقوم العميل باختيار محافظته أثناء عملية إتمام الشراء، سيقوم النظام بحساب وإضافة سعر الشحن المخصص لهذه المحافظة تلقائياً.' 
                        : 'Set custom shipping costs per governorate. When a customer selects their governorate during checkout, the fee is automatically calculated and added to the total order.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                  <button 
                    onClick={handleResetDefaultShippingRates}
                    className="px-4 py-2.5 border border-black/15 dark:border-white/15 text-zinc-700 dark:text-white/70 hover:border-black dark:hover:border-white transition-all uppercase font-bold text-[10px]"
                  >
                    {lang === 'ar' ? 'إعادة للافتراضي' : 'RESET DEFAULTS'}
                  </button>
                  <button 
                    onClick={handleSaveShippingRates}
                    className="flex-1 md:flex-initial px-6 py-2.5 bg-amber-500 text-black font-bold uppercase hover:bg-amber-400 transition-all shadow-md flex items-center justify-center gap-2 text-[10px] tracking-widest"
                  >
                    <Check size={14} />
                    {lang === 'ar' ? 'حفظ أسعار الشحن' : 'SAVE ALL RATES'}
                  </button>
                </div>
              </div>

              {/* Bulk Rate Tool & Search Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Search Governorates */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-4 flex items-center gap-3">
                  <Search size={16} className="text-zinc-400 shrink-0" />
                  <input 
                    type="text" 
                    value={shippingSearch}
                    onChange={(e) => setShippingSearch(e.target.value)}
                    placeholder={lang === 'ar' ? 'بحث عن محافظة (مثلاً: القاهرة، الإسكندرية)...' : 'Search governorate (e.g. Cairo, Alexandria)...'}
                    className="w-full bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-white/30 focus:outline-none font-medium"
                  />
                  {shippingSearch && (
                    <button onClick={() => setShippingSearch('')} className="text-zinc-400 hover:text-black dark:hover:text-white text-xs font-bold">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Bulk Set Price Tool */}
                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-4 flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-white/50 uppercase shrink-0">
                    {lang === 'ar' ? 'سعر موحد للكل:' : 'FLAT RATE FOR ALL:'}
                  </span>
                  <input 
                    type="number" 
                    value={bulkRateValue}
                    onChange={(e) => setBulkRateValue(e.target.value)}
                    placeholder="E.G. 60"
                    className="w-24 bg-zinc-100 dark:bg-white/5 border border-black/10 dark:border-white/10 px-3 py-1 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none"
                  />
                  <button 
                    onClick={handleApplyBulkRate}
                    className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold uppercase hover:bg-zinc-800 dark:hover:bg-white/80 transition-colors text-[9px] tracking-wider"
                  >
                    {lang === 'ar' ? 'تطبيق على جميع المحافظات' : 'APPLY TO ALL'}
                  </button>
                </div>
              </div>

              {/* Governorates Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {EGYPT_GOVERNORATES
                  .filter(gov => 
                    gov.nameAr.includes(shippingSearch) || 
                    gov.nameEn.toLowerCase().includes(shippingSearch.toLowerCase())
                  )
                  .map((gov, idx) => {
                    const currentRate = shippingRatesMap[gov.nameAr] ?? gov.defaultPrice;
                    const isDefault = currentRate === gov.defaultPrice;

                    return (
                      <div 
                        key={`${gov.id}-${idx}`} 
                        className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 rounded-2xl flex flex-col justify-between h-full gap-5 shadow-xs hover:border-amber-500/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{gov.nameAr}</h3>
                            <span className="text-[10px] text-zinc-400 dark:text-white/40 uppercase font-mono font-medium block mt-0.5">
                              {gov.nameEn}
                            </span>
                          </div>
                          <span className={`text-[8px] font-bold uppercase px-2.5 py-1 rounded-md border ${
                            currentRate === 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                            isDefault ? 'bg-zinc-100 dark:bg-white/5 text-zinc-500 dark:text-white/40 border-black/10 dark:border-white/10' :
                            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            {currentRate === 0 ? (lang === 'ar' ? 'شحن مجاني' : 'FREE SHIPPING') : isDefault ? (lang === 'ar' ? 'افتراضي' : 'DEFAULT') : (lang === 'ar' ? 'معدل' : 'CUSTOM')}
                          </span>
                        </div>

                        {/* Input & Quick Action Buttons */}
                        <div className="flex flex-col gap-2.5 pt-3 border-t border-black/5 dark:border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400 dark:text-white/40 font-semibold">{lang === 'ar' ? 'السعر:' : 'FEE:'}</span>
                            <div className="relative flex-1">
                              <input 
                                type="number" 
                                min="0"
                                value={currentRate}
                                onChange={(e) => handleRateChange(gov.nameAr, Number(e.target.value))}
                                className="w-full bg-zinc-50 dark:bg-white/5 border border-black/20 dark:border-white/20 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 pr-12"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-400 dark:text-white/40 pointer-events-none">
                                {lang === 'ar' ? 'ج.م' : 'EGP'}
                              </span>
                            </div>
                          </div>

                          {/* Quick adjustment pills */}
                          <div className="flex items-center gap-1.5 justify-end">
                            <button 
                              onClick={() => handleRateChange(gov.nameAr, 0)}
                              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-bold border border-emerald-500/20 uppercase rounded-md cursor-pointer"
                              title="Set Free Shipping"
                            >
                              {lang === 'ar' ? 'مجاني' : 'FREE'}
                            </button>
                            <button 
                              onClick={() => handleRateChange(gov.nameAr, currentRate - 10)}
                              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-white/70 text-[8px] font-bold border border-black/10 dark:border-white/10 rounded-md cursor-pointer"
                            >
                              -10
                            </button>
                            <button 
                              onClick={() => handleRateChange(gov.nameAr, currentRate + 10)}
                              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-700 dark:text-white/70 text-[8px] font-bold border border-black/10 dark:border-white/10 rounded-md cursor-pointer"
                            >
                              +10
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="p-6 bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 flex justify-between items-center shadow-lg">
                <span className="text-[10px] text-zinc-500 dark:text-white/50 uppercase font-medium">
                  {lang === 'ar' ? 'إجمالي المحافظات: 27 محافظة مصرية' : 'TOTAL GOVERNORATES: 27 EGYPTIAN PROVINCES'}
                </span>
                <button 
                  onClick={handleSaveShippingRates}
                  className="px-8 py-3 bg-amber-500 text-black font-bold uppercase hover:bg-amber-400 transition-all shadow-md flex items-center gap-2 text-[10px] tracking-widest"
                >
                  <Check size={16} />
                  {lang === 'ar' ? 'حفظ وتطبيق جميع أسعار الشحن' : 'SAVE & APPLY ALL SHIPPING RATES'}
                </button>
              </div>

            </div>
          )}

          {/* COUPONS TAB VIEW */}
          {activeTab === 'coupons' && (
            <div className="flex flex-col gap-8">
              <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                  <h3 className="text-sm uppercase font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Ticket className="text-amber-500" size={18} />
                    {lang === 'ar' ? 'إضافة كوبون خصم جديد' : 'CREATE NEW DISCOUNT COUPON'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-white/50">
                        {lang === 'ar' ? 'كود الخصم (رمز الكوبون)' : 'COUPON CODE'}
                      </label>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                        {lang === 'ar' ? 'تلقائي أو يدوياً' : 'AUTO / MANUAL'}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        placeholder="E.G. AVENTO20"
                        className="flex-1 min-w-0 bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 p-2.5 text-xs font-mono font-bold uppercase text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setNewCouponCode(generateRandomCouponCode())}
                        className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase shrink-0 cursor-pointer rounded-xs"
                        title={lang === 'ar' ? 'توليد كود عشوائي جديد' : 'Generate random code'}
                      >
                        <RefreshCw size={12} />
                        <span>{lang === 'ar' ? 'توليد جديد' : 'GENERATE'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-white/50">
                      {lang === 'ar' ? 'نوع الخصم' : 'DISCOUNT TYPE'}
                    </label>
                    <select 
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as 'percentage' | 'fixed')}
                      className="bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                    >
                      <option value="percentage" className="bg-white text-black dark:bg-black dark:text-white">
                        {lang === 'ar' ? 'نسبة مئوية (%)' : 'Percentage (%)'}
                      </option>
                      <option value="fixed" className="bg-white text-black dark:bg-black dark:text-white">
                        {lang === 'ar' ? 'مبلغ ثابت (ج.م)' : 'Fixed EGP'}
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-white/50">
                      {lang === 'ar' ? 'قيمة الخصم' : 'DISCOUNT VALUE'}
                    </label>
                    <input 
                      type="number" 
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      placeholder="E.G. 15"
                      className="bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 p-2.5 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-white/50">
                      {lang === 'ar' ? 'الحد الأدنى للطلب (اختياري)' : 'MIN ORDER (OPTIONAL)'}
                    </label>
                    <input 
                      type="number" 
                      value={newCouponMinOrder}
                      onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                      placeholder="E.G. 1000"
                      className="bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 p-2.5 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Scope Target Selection (Product/Category/All) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-black/10 dark:border-white/10">
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Tag size={12} />
                      {lang === 'ar' ? 'نطاق تطبيق الخصم' : 'APPLICABLE SCOPE'}
                    </label>
                    <select 
                      value={newCouponScope}
                      onChange={(e) => setNewCouponScope(e.target.value as 'all' | 'product' | 'category')}
                      className="bg-zinc-50 dark:bg-white/5 border border-black/15 dark:border-white/15 p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="all" className="bg-white text-black dark:bg-black dark:text-white">
                        {lang === 'ar' ? 'جميع منتجات المتجر' : 'All Store Products'}
                      </option>
                      <option value="product" className="bg-white text-black dark:bg-black dark:text-white">
                        {lang === 'ar' ? 'منتج واحد محدد' : 'Specific Product Only'}
                      </option>
                      <option value="category" className="bg-white text-black dark:bg-black dark:text-white">
                        {lang === 'ar' ? 'تصنيف محدد كامل' : 'Specific Category Only'}
                      </option>
                    </select>
                  </div>

                  {newCouponScope === 'product' && (
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-white/50">
                        {lang === 'ar' ? 'اختر المنتج المخصص للخصم' : 'SELECT TARGET PRODUCT'}
                      </label>
                      <select 
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="bg-zinc-50 dark:bg-white/5 border border-amber-500 p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                      >
                        <option value="" className="bg-white text-black dark:bg-black dark:text-white">
                          {lang === 'ar' ? '-- اختر منتجاً من القائمة --' : '-- Select a product --'}
                        </option>
                        {products.map((p, idx) => (
                          <option key={`${p.id}-${idx}`} value={p.id} className="bg-white text-black dark:bg-black dark:text-white">
                            {p.name} ({p.price} {lang === 'ar' ? 'ج.م' : 'EGP'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {newCouponScope === 'category' && (
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-white/50">
                        {lang === 'ar' ? 'اختر التصنيف المخصص للخصم' : 'SELECT TARGET CATEGORY'}
                      </label>
                      <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-zinc-50 dark:bg-white/5 border border-amber-500 p-2.5 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                      >
                        <option value="" className="bg-white text-black dark:bg-black dark:text-white">
                          {lang === 'ar' ? '-- اختر تصنيفاً من القائمة --' : '-- Select a category --'}
                        </option>
                        {categoriesList.map((cat, idx) => (
                          <option key={`${cat}-${idx}`} value={cat} className="bg-white text-black dark:bg-black dark:text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleAddCoupon}
                  className="mt-2 py-3 bg-amber-500 text-black font-bold uppercase hover:bg-amber-400 transition-colors text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={16} />
                  {lang === 'ar' ? 'إنشاء وتفعيل الكوبون' : 'CREATE & ACTIVATE COUPON'}
                </button>
              </div>

              {/* Coupons List */}
              <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 flex flex-col gap-6">
                <h3 className="text-xs uppercase font-bold text-zinc-900 dark:text-white pb-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                  <span>{lang === 'ar' ? 'الكوبونات الفعالة والمنشأة' : 'ACTIVE STORE COUPONS'}</span>
                  <span className="font-mono text-amber-500 font-bold">{(settings.coupons || []).length}</span>
                </h3>

                {(!settings.coupons || settings.coupons.length === 0) ? (
                  <p className="text-xs text-zinc-400 dark:text-white/40 py-12 text-center italic">
                    {lang === 'ar' ? 'لا توجد كوبونات مضافة بعد. يمكنك إنشاء كوبونات مثل AVENTO10 أو WELCOME200 أعلاه.' : 'No active coupons created yet.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {settings.coupons.map((c, idx) => (
                      <div key={`${c.id}-${idx}`} className={`p-6 border rounded-2xl flex flex-col justify-between h-full gap-5 relative overflow-hidden transition-all ${
                        c.active ? 'bg-zinc-50 dark:bg-white/5 border-amber-500/40 shadow-xs' : 'bg-zinc-100/50 dark:bg-white/2 border-black/10 opacity-60'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-base font-black tracking-widest text-amber-600 dark:text-amber-400 block uppercase">
                              {c.code}
                            </span>
                            <span className="text-[10px] text-zinc-500 dark:text-white/60 font-semibold mt-1 block">
                              {c.discountType === 'percentage' 
                                ? `${c.discountValue}% ${lang === 'ar' ? 'خصم على إجمالي المشتريات' : 'OFF TOTAL'}` 
                                : `${c.discountValue} {lang === 'ar' ? 'ج.م' : 'EGP'} ${lang === 'ar' ? 'خصم مباشر' : 'FLAT DISCOUNT'}`
                              }
                            </span>
                          </div>

                          <span className={`text-[8px] font-bold uppercase px-2.5 py-1 rounded-md border ${
                            c.active ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-zinc-300 dark:bg-white/10 text-zinc-600 dark:text-white/50 border-black/10'
                          }`}>
                            {c.active ? (lang === 'ar' ? 'مفعل' : 'ACTIVE') : (lang === 'ar' ? 'معطل' : 'INACTIVE')}
                          </span>
                        </div>

                        {c.applicableProductName ? (
                          <div className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                            <Tag size={12} />
                            <span>{lang === 'ar' ? `مخصص لمنتج: ${c.applicableProductName}` : `PRODUCT: ${c.applicableProductName}`}</span>
                          </div>
                        ) : c.applicableCategory ? (
                          <div className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                            <Tag size={12} />
                            <span>{lang === 'ar' ? `مخصص لتصنيف: ${c.applicableCategory}` : `CATEGORY: ${c.applicableCategory}`}</span>
                          </div>
                        ) : (
                          <div className="text-[9px] text-zinc-400 dark:text-white/40 font-semibold">
                            {lang === 'ar' ? 'ينطبق على جميع منتجات المتجر' : 'Applies to all store products'}
                          </div>
                        )}

                        {c.minOrderAmount && (
                          <span className="text-[9px] text-zinc-400 dark:text-white/40 font-mono">
                            {lang === 'ar' ? `الحد الأدنى للطلب: ${c.minOrderAmount} ج.م` : `MIN ORDER: ${c.minOrderAmount} EGP`}
                          </span>
                        )}

                        <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3.5">
                          <button 
                            onClick={() => handleToggleCouponStatus(c.id)}
                            className="text-[9px] font-bold uppercase text-zinc-600 dark:text-white/70 hover:text-amber-500 transition-colors cursor-pointer"
                          >
                            {c.active ? (lang === 'ar' ? 'تعطيل الكوبون' : 'DISABLE') : (lang === 'ar' ? 'تفعيل الكوبون' : 'ENABLE')}
                          </button>

                          <button 
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="text-rose-500 hover:text-rose-700 text-[9px] font-bold uppercase flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                            {lang === 'ar' ? 'حذف' : 'DELETE'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: RESTOCK NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-6">
              {/* Header & KPI Summary */}
              <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold uppercase luxury-tracking">
                      {lang === 'ar' ? 'إشعارات التوفر وقوائم الانتظار' : 'RESTOCK NOTIFICATIONS & WAITLISTS'}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {lang === 'ar' 
                        ? 'إدارة طلبات الإشعار المسجلة من العملاء للمنتجات غير المتوفرة (Sold Out)'
                        : 'Manage customer restock request notifications stored in Firestore'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col items-center">
                    <span className="text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400">
                      {lang === 'ar' ? 'طلبات معلقة' : 'PENDING'}
                    </span>
                    <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                      {notificationsList.filter(n => !n.notified).length}
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col items-center">
                    <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                      {lang === 'ar' ? 'تم التنبيه' : 'NOTIFIED'}
                    </span>
                    <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {notificationsList.filter(n => n.notified).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Filter Controls & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      notifFilter === 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'الكل' : 'ALL'} ({notificationsList.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      notifFilter === 'pending'
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'bg-zinc-100 dark:bg-white/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                    }`}
                  >
                    <Bell size={12} />
                    {lang === 'ar' ? 'بانتظار التوفر' : 'PENDING WAITLIST'} ({notificationsList.filter(n => !n.notified).length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('notified')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      notifFilter === 'notified'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-white/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    <CheckCircle size={12} />
                    {lang === 'ar' ? 'تم تنبيههم' : 'NOTIFIED'} ({notificationsList.filter(n => n.notified).length})
                  </button>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={notifSearch}
                    onChange={(e) => setNotifSearch(e.target.value)}
                    placeholder={lang === 'ar' ? 'بحث بالمنتج أو معرف المستخدم...' : 'Search product or User ID...'}
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-9 rtl:pr-9 rtl:pl-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Notifications List Table / Cards */}
              {(() => {
                const filtered = notificationsList.filter(n => {
                  if (notifFilter === 'pending' && n.notified) return false;
                  if (notifFilter === 'notified' && !n.notified) return false;
                  if (notifSearch.trim()) {
                    const q = notifSearch.toLowerCase();
                    const matchProd = n.productName?.toLowerCase().includes(q) || n.productId?.toLowerCase().includes(q);
                    const matchUser = n.userId?.toLowerCase().includes(q) || n.userEmail?.toLowerCase().includes(q) || n.userPhone?.toLowerCase().includes(q);
                    return matchProd || matchUser;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                      <Bell size={36} className="text-zinc-300 dark:text-zinc-700" />
                      <h3 className="text-xs font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' ? 'لا توجد طلبات إشعار تطابق البحث' : 'NO NOTIFICATION REQUESTS FOUND'}
                      </h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm">
                        {lang === 'ar' 
                          ? 'عندما يضغط العملاء على زر "أبلغني عند التوفر" للمنتجات المباعة بالكامل، ستظهر طلباتهم ومعرفاتهم هنا تلقائياً.'
                          : 'When customers click "Notify Me" on sold-out products, their user IDs and restock requests will appear here.'
                        }
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left rtl:text-right text-xs">
                        <thead className="bg-zinc-50 dark:bg-white/5 text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 border-b border-black/10 dark:border-white/10">
                          <tr>
                            <th className="p-3.5">{lang === 'ar' ? 'المنتج المطلوب' : 'TARGET PRODUCT'}</th>
                            <th className="p-3.5">{lang === 'ar' ? 'معرف المستخدم (User ID)' : 'USER ID & CONTACT'}</th>
                            <th className="p-3.5">{lang === 'ar' ? 'تاريخ الطلب' : 'REQUEST DATE'}</th>
                            <th className="p-3.5">{lang === 'ar' ? 'حالة التنبيه' : 'STATUS'}</th>
                            <th className="p-3.5 text-center">{lang === 'ar' ? 'الإجراءات' : 'ACTIONS'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 dark:divide-white/5">
                          {filtered.map((n, idx) => {
                            const targetProd = products.find(p => p.id === n.productId);
                            return (
                              <tr key={`${n.id}-${idx}`} className="hover:bg-black/2 dark:hover:bg-white/2 transition-colors">
                                {/* Target Product */}
                                <td className="p-3.5">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={targetProd?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'} 
                                      alt={n.productName} 
                                      className="w-10 h-10 object-cover rounded-lg border border-black/10 dark:border-white/10 shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                                        {n.productName || targetProd?.name || 'Unknown Product'}
                                      </span>
                                      <span className="text-[10px] font-mono text-zinc-400 truncate">
                                        ID: {n.productId}
                                      </span>
                                    </div>
                                  </div>
                                </td>

                                {/* User ID & Contact */}
                                <td className="p-3.5">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                      <Users size={12} /> {n.userId || 'Guest User'}
                                    </span>
                                    {(n.userEmail || n.userPhone) && (
                                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                                        {n.userEmail || n.userPhone}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Request Date */}
                                <td className="p-3.5 font-mono text-xs text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                                  {formatDateSafely(n.createdAt)}
                                </td>

                                {/* Status */}
                                <td className="p-3.5 whitespace-nowrap">
                                  {n.notified ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                      <CheckCircle size={12} />
                                      {lang === 'ar' ? 'تم التنبيه' : 'NOTIFIED'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                      <Bell size={12} />
                                      {lang === 'ar' ? 'بانتظار التوفر' : 'WAITING'}
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="p-3.5 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {!n.notified && (
                                      <button
                                        onClick={async () => {
                                          await triggerNotificationsForProduct(n.productId, n.productName);
                                          setRestockAlertToast({
                                            productName: n.productName,
                                            count: 1
                                          });
                                          setTimeout(() => setRestockAlertToast(null), 5000);
                                        }}
                                        className="px-2.5 py-1 bg-amber-500 text-black font-extrabold text-[10px] uppercase rounded-lg hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                        title={lang === 'ar' ? 'إرسال تنبيه لهذا المستخدم الآن' : 'Trigger Notification Now'}
                                      >
                                        <Bell size={10} />
                                        <span>{lang === 'ar' ? 'تنبيه' : 'NOTIFY'}</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={async () => {
                                        await deleteNotification(n.id);
                                      }}
                                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                      title={lang === 'ar' ? 'حذف هذا الطلب' : 'Delete Request'}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* REVIEWS MANAGEMENT TAB */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-6">
              {/* Reviews Header Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 rounded-2xl border border-amber-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase luxury-tracking text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                    <Star size={12} className="fill-amber-500 text-amber-500" />
                    {lang === 'ar' ? 'إدارة تقييمات العملاء وآراء المنتجات' : 'CUSTOMER REVIEWS & MODERATION'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {lang === 'ar' ? 'آراء وتقييمات العملاء' : 'Product Reviews & Ratings'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {lang === 'ar'
                      ? 'مراجعة وتقييمات المشتريات، الموافقة على المراجعات الممتازة، والرد على استفسارات العملاء.'
                      : 'Moderate customer ratings, approve verified purchaser reviews, and pin featured store testimonials.'}
                  </p>
                </div>

                {/* Metrics Summary Badges */}
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-center">
                    <span className="text-[9px] font-bold uppercase text-zinc-400 block">{lang === 'ar' ? 'متوسط التقييم' : 'AVG RATING'}</span>
                    <span className="text-lg font-black text-amber-500 font-mono flex items-center justify-center gap-1">
                      <Star size={14} className="fill-amber-500" /> 4.9
                    </span>
                  </div>
                  <div className="px-4 py-2 bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl text-center">
                    <span className="text-[9px] font-bold uppercase text-zinc-400 block">{lang === 'ar' ? 'إجمالي المراجعات' : 'TOTAL REVIEWS'}</span>
                    <span className="text-lg font-black text-zinc-900 dark:text-white font-mono">{reviewsList.length}</span>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                    <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block">{lang === 'ar' ? 'معتمدة' : 'APPROVED'}</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      {reviewsList.filter(r => r.status === 'approved').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls Bar: Rating Filter & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 p-4 rounded-2xl">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setReviewFilterRating('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      reviewFilterRating === 'all'
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                        : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'جميع التقييمات' : 'ALL REVIEWS'} ({reviewsList.length})
                  </button>

                  {[5, 4, 3].map(ratingStars => (
                    <button
                      key={ratingStars}
                      onClick={() => setReviewFilterRating(ratingStars)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        reviewFilterRating === ratingStars
                          ? 'bg-amber-500 text-black shadow-xs font-black'
                          : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:bg-amber-500/10'
                      }`}
                    >
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                      <span>{ratingStars} {lang === 'ar' ? 'نجوم' : 'Stars'}</span>
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    placeholder={lang === 'ar' ? 'بحث بالعميل أو المنتج أو المراجعة...' : 'Search customer, product or text...'}
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl pl-9 rtl:pr-9 rtl:pl-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Reviews List Cards */}
              {(() => {
                const filtered = reviewsList.filter(r => {
                  if (reviewFilterRating !== 'all' && r.rating !== reviewFilterRating) return false;
                  if (reviewSearch.trim()) {
                    const q = reviewSearch.toLowerCase();
                    const matchUser = r.userName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q);
                    const matchProd = r.productName.toLowerCase().includes(q);
                    const matchComment = r.comment.toLowerCase().includes(q);
                    return matchUser || matchProd || matchComment;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                      <Star size={36} className="text-zinc-300 dark:text-zinc-700" />
                      <h3 className="text-xs font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' ? 'لا توجد تقييمات تطابق البحث' : 'NO REVIEWS FOUND'}
                      </h3>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 gap-4">
                    {filtered.map((rev) => (
                      <div 
                        key={rev.id}
                        className={`bg-white dark:bg-[#0A0A0A] border rounded-2xl p-4 sm:p-5 flex flex-col gap-4 transition-all shadow-xs ${
                          rev.isFeatured 
                            ? 'border-amber-500/40 ring-1 ring-amber-500/20' 
                            : 'border-black/10 dark:border-white/5'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-3">
                          {/* Product Info */}
                          <div className="flex items-center gap-3">
                            <img 
                              src={rev.productImage} 
                              alt={rev.productName} 
                              className="w-11 h-11 object-cover rounded-xl border border-black/10 dark:border-white/10 shrink-0"
                            />
                            <div>
                              <span className="font-bold text-xs text-zinc-900 dark:text-white block">
                                {rev.productName}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                ID: {rev.productId}
                              </span>
                            </div>
                          </div>

                          {/* Rating Stars & Badges */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5 px-2.5 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={13} 
                                  className={i < rev.rating ? "fill-amber-400 text-amber-500" : "text-zinc-300 dark:text-zinc-700"} 
                                />
                              ))}
                              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 ml-1.5 rtl:mr-1.5 rtl:ml-0">
                                {rev.rating}.0
                              </span>
                            </div>

                            {rev.isFeatured && (
                              <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-extrabold uppercase rounded-lg flex items-center gap-1 shadow-xs">
                                <Sparkles size={11} />
                                {lang === 'ar' ? 'مميّز' : 'FEATURED'}
                              </span>
                            )}

                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase ${
                              rev.status === 'approved' 
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            }`}>
                              {rev.status === 'approved' ? (lang === 'ar' ? 'معتمد' : 'APPROVED') : (lang === 'ar' ? 'بانتظار المراجعة' : 'PENDING')}
                            </span>
                          </div>
                        </div>

                        {/* Customer Comment */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <Users size={12} className="text-amber-500" />
                              {rev.userName} <span className="text-zinc-400 text-[11px] font-normal">({rev.userEmail})</span>
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">{rev.createdAt}</span>
                          </div>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">
                            "{rev.comment}"
                          </p>
                        </div>

                        {/* Existing Admin Reply */}
                        {rev.reply && (
                          <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <MessageSquare size={11} />
                              {lang === 'ar' ? 'رد المتجر الرسمي:' : 'Official Store Response:'}
                            </span>
                            <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                              {rev.reply}
                            </p>
                          </div>
                        )}

                        {/* Reply Form & Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              value={reviewReplyInput[rev.id] || ''}
                              onChange={(e) => setReviewReplyInput(prev => ({ ...prev, [rev.id]: e.target.value }))}
                              placeholder={lang === 'ar' ? 'اكتب رداً رسمياً من إدارة المتجر...' : 'Write official admin reply...'}
                              className="flex-1 sm:w-64 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                            />
                            <button
                              onClick={() => handleSaveReviewReply(rev.id)}
                              className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                            >
                              {lang === 'ar' ? 'إرسال الرد' : 'Reply'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              onClick={() => handleToggleFeaturedReview(rev.id)}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                                rev.isFeatured 
                                  ? 'bg-amber-500 text-black' 
                                  : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-amber-500/10'
                              }`}
                            >
                              <Sparkles size={12} />
                              <span>{rev.isFeatured ? (lang === 'ar' ? 'إلغاء التمييز' : 'Unfeature') : (lang === 'ar' ? 'تمييز Review' : 'Feature')}</span>
                            </button>

                            <button
                              onClick={() => handleToggleReviewStatus(rev.id)}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
                                rev.status === 'approved'
                                  ? 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300'
                                  : 'bg-emerald-500 text-white'
                              }`}
                            >
                              <CheckCircle size={12} />
                              <span>{rev.status === 'approved' ? (lang === 'ar' ? 'تعليق' : 'Suspend') : (lang === 'ar' ? 'اعتماد' : 'Approve')}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ADMIN ALERTS TAB (PUSH NOTIFICATIONS) */}
          {activeTab === 'admin-alerts' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white text-zinc-900 dark:bg-[#0A0A0A] dark:text-white border border-black/10 dark:border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold uppercase luxury-tracking">
                      {lang === 'ar' ? 'مركز التنبيهات' : 'NOTIFICATION CENTER'}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {lang === 'ar' 
                        ? 'تنبيهات فورية عند وصول طلبات جديدة أو تحديثات المتجر'
                        : 'Real-time alerts for new orders and store activities'
                      }
                    </p>
                  </div>
                </div>
                {adminNotifications.some(n => !n.isRead) && (
                  <button
                    onClick={() => markAllNotificationsAsRead(adminNotifications)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    <CheckCircle size={14} />
                    {lang === 'ar' ? 'تحديد الكل كمقروء' : 'MARK ALL READ'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {adminNotifications.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl shadow-xs">
                    <Bell className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                      {lang === 'ar' ? 'لا توجد تنبيهات' : 'No Notifications'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {lang === 'ar' ? 'ستظهر هنا إشعارات الطلبات الجديدة' : 'Alerts for new orders will appear here'}
                    </p>
                  </div>
                ) : (
                  adminNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border ${notif.isRead ? 'bg-zinc-50 dark:bg-white/5 border-transparent' : 'bg-white dark:bg-zinc-900 border-amber-500/30 shadow-sm'}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full mt-1 ${notif.isRead ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                          {notif.type === 'NEW_ORDER' ? <ShoppingBag size={18} /> : 
                           notif.type === 'LOW_STOCK' ? <AlertTriangle size={18} /> : 
                           <Bell size={18} />}
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${notif.isRead ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-900 dark:text-white'}`}>
                            {notif.title}
                          </h4>
                          <p className={`text-xs mt-1 ${notif.isRead ? 'text-zinc-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                            {notif.body}
                          </p>
                          <p className="text-[10px] text-zinc-400 mt-2 font-mono">
                            {formatDateSafely(notif.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-zinc-900 dark:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            {lang === 'ar' ? 'مقروء' : 'Mark Read'}
                          </button>
                        )}
                        {notif.relatedId && notif.type === 'NEW_ORDER' && (
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            {lang === 'ar' ? 'عرض الطلب' : 'View Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* GENERAL STORE SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-6 max-w-4xl">
              {/* Settings Header */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase luxury-tracking text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                    <Settings size={12} />
                    {lang === 'ar' ? 'إعدادات ومتجر العلامة التجارية' : 'STORE IDENTITY & GENERAL CONFIG'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    {lang === 'ar' ? 'إعدادات المتجر العامة' : 'General Store Settings'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {lang === 'ar'
                      ? 'التحكم في اسم العلامة التجارية، بريد الدعم، أسعار الشحن المجاني، وسائل التواصل والشريط الإعلاني.'
                      : 'Configure store name, support contacts, free shipping thresholds, social profiles, and announcement banner.'}
                  </p>
                </div>

                <button
                  onClick={handleSaveGeneralSettings}
                  className="px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black font-bold text-xs rounded-xl shadow-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Check size={14} />
                  <span>{lang === 'ar' ? 'حفظ كافة الإعدادات' : 'SAVE STORE CONFIG'}</span>
                </button>
              </div>

              {settingsSavedSuccess && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-3 shadow-md animate-fadeIn">
                  <CheckCircle size={18} className="text-emerald-500" />
                  <span className="text-xs font-bold">
                    {lang === 'ar' ? 'تم حفظ كافة إعدادات المتجر بنجاح!' : 'All store settings saved successfully!'}
                  </span>
                </div>
              )}

              {/* 1. Store Identity */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
                <h3 className="text-sm font-extrabold uppercase luxury-tracking text-zinc-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2">
                  <Globe size={16} className="text-amber-500" />
                  {lang === 'ar' ? 'هوية المتجر والدعم' : 'Brand Identity & Support'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'اسم المتجر والعلامة التجارية' : 'STORE BRAND NAME'}
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'عملة المتجر الأساسية' : 'STORE CURRENCY'}
                    </label>
                    <input
                      type="text"
                      value={storeCurrency}
                      onChange={(e) => setStoreCurrency(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'بريد خدمة العملاء' : 'SUPPORT EMAIL'}
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'هاتف التواصل / واتساب' : 'SUPPORT PHONE / WHATSAPP'}
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Announcement Marquee & Shipping Policy */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
                <h3 className="text-sm font-extrabold uppercase luxury-tracking text-zinc-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2">
                  <Truck size={16} className="text-amber-500" />
                  {lang === 'ar' ? 'الشريط الإعلاني وسياسة الشحن' : 'Announcement Marquee & Free Shipping Threshold'}
                </h3>

                <div className="grid grid-cols-1 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'نص الشريط المتحرك العلوي (Announcement Bar)' : 'TOP ANNOUNCEMENT MARQUEE TEXT'}
                    </label>
                    <input
                      type="text"
                      value={marqueeText}
                      onChange={(e) => setMarqueeText(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'حد الشحن المجاني التلقائي (ج.م)' : 'FREE SHIPPING MINIMUM ORDER THRESHOLD (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5 font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Social Profiles */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
                <h3 className="text-sm font-extrabold uppercase luxury-tracking text-zinc-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-3 flex items-center gap-2">
                  <Share2 size={16} className="text-amber-500" />
                  {lang === 'ar' ? 'حسابات التواصل الاجتماعي' : 'Social Media Channels'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Facebook size={12} className="text-blue-500" /> Facebook
                    </label>
                    <input
                      type="text"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/a7store"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Instagram size={12} className="text-pink-500" /> Instagram
                    </label>
                    <input
                      type="text"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/a7store"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Zap size={12} className="text-amber-500" /> TikTok
                    </label>
                    <input
                      type="text"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="https://tiktok.com/@a7store"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Telegram Notifications */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
                <div className="border-b border-black/5 dark:border-white/5 pb-3">
                  <h3 className="text-sm font-extrabold uppercase luxury-tracking text-zinc-900 dark:text-white flex items-center gap-2">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#0088cc]"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                    {lang === 'ar' ? 'إشعارات تليجرام الفورية' : 'Telegram Instant Notifications'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {lang === 'ar' ? 'أدخل بيانات البوت الخاص بك لتتلقى إشعارات الطلبات الجديدة على هاتفك عبر تطبيق تليجرام، حتى لو كان الموقع مغلقاً.' : 'Receive instant new order notifications on your phone via Telegram, even when the site is closed.'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'توكن البوت (Bot Token)' : 'BOT TOKEN'}
                    </label>
                    <input
                      type="text"
                      value={telegramBotToken}
                      onChange={(e) => setTelegramBotToken(e.target.value)}
                      placeholder="e.g. 123456789:ABCdefGHIjklmnoPQRstuvWXYZ"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'رقم الشات (Chat ID)' : 'CHAT ID'}
                    </label>
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="e.g. 123456789"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Push Notification Settings */}
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-3">
                  <h3 className="text-sm font-extrabold uppercase luxury-tracking text-zinc-900 dark:text-white flex items-center gap-2">
                    <Bell size={16} className="text-amber-500" />
                    {lang === 'ar' ? 'إعدادات تنبيهات المتصفح' : 'Browser Notification Settings'}
                  </h3>
                  <button 
                    onClick={() => {
                      if ("Notification" in window && Notification.permission !== "granted") {
                        Notification.requestPermission();
                      }
                      if (!notifSettings.isMuted) {
                        audioPlayer.play(notifSettings.soundUrl, notifSettings.volume);
                      }
                      if (notifSettings.vibrate && navigator.vibrate) {
                        navigator.vibrate([200, 100, 200]);
                      }
                      
                      // Trigger a real SW notification
                      if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.ready.then((registration) => {
                          registration.showNotification(lang === 'ar' ? '🔔 اختبار التنبيهات' : '🔔 Test Alert', {
                            body: lang === 'ar' ? 'هذا اختبار لصوت التنبيهات وإعداداتها' : 'This is a test to verify your notification settings',
                            icon: '/vite.svg',
                            vibrate: notifSettings.vibrate ? [200, 100, 200] : undefined,
                          } as any);
                        }).catch(e => console.error("SW notification error:", e));
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Bell size={14} />
                    {lang === 'ar' ? 'اختبار التنبيه' : 'Test Alert'}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' ? 'صوت الإشعار الافتراضي' : 'Default Sound'}
                      </label>
                      <select 
                        value={notifSettings.soundUrl}
                        onChange={(e) => {
                          const url = e.target.value;
                          setNotifSettings({ ...notifSettings, soundUrl: url });
                          audioPlayer.play(url, notifSettings.volume);
                        }}
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="/sounds/shopify.wav">Shopify Style</option>
                        <option value="/sounds/apple.wav">Apple Style</option>
                        <option value="/sounds/minimal_click.wav">Minimal Click</option>
                        <option value="/sounds/soft_bell.wav">Soft Bell</option>
                        <option value="/sounds/premium_ding.wav">Premium Ding</option>
                        <option value="/sounds/luxury_chime.wav">Luxury Chime</option>
                        <option value="/sounds/digital_pulse.wav">Digital Pulse</option>
                        <option value="/sounds/elegant_glass.wav">Elegant Glass</option>
                        <option value="/sounds/success_tone.wav">Success Tone</option>
                        <option value="/sounds/modern_notification.wav">Modern Notification</option>
                        <option value="/sounds/linear.wav">Linear Style</option>
                        <option value="/sounds/stripe.wav">Stripe Style</option>
                      </select>
                    </div>

                    {[
                      { key: 'newOrder', label: '🛍️ New Orders', labelAr: '🛍️ طلبات جديدة' },
                      { key: 'paymentConfirmed', label: '💳 Payment Confirmed', labelAr: '💳 تأكيد الدفع' },
                      { key: 'orderShipped', label: '🚚 Order Shipped', labelAr: '🚚 شحن الطلب' },
                      { key: 'orderCancelled', label: '❌ Order Cancelled', labelAr: '❌ إلغاء الطلب' },
                      { key: 'lowStock', label: '⚠️ Low Stock', labelAr: '⚠️ انخفاض المخزون' },
                      { key: 'newCustomer', label: '👤 New Customer', labelAr: '👤 عميل جديد' }
                    ].map((type) => (
                      <div key={type.key} className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                          {lang === 'ar' ? type.labelAr : type.label}
                        </label>
                        <div className="flex gap-2">
                          <select 
                            value={notifSettings.soundsByType[type.key as keyof typeof notifSettings.soundsByType]}
                            onChange={(e) => {
                              const url = e.target.value;
                              setNotifSettings({ 
                                ...notifSettings, 
                                soundsByType: { ...notifSettings.soundsByType, [type.key]: url }
                              });
                            }}
                            className="flex-1 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="/sounds/shopify.wav">Shopify Style</option>
                            <option value="/sounds/apple.wav">Apple Style</option>
                            <option value="/sounds/minimal_click.wav">Minimal Click</option>
                            <option value="/sounds/soft_bell.wav">Soft Bell</option>
                            <option value="/sounds/premium_ding.wav">Premium Ding</option>
                            <option value="/sounds/luxury_chime.wav">Luxury Chime</option>
                            <option value="/sounds/digital_pulse.wav">Digital Pulse</option>
                            <option value="/sounds/elegant_glass.wav">Elegant Glass</option>
                            <option value="/sounds/success_tone.wav">Success Tone</option>
                            <option value="/sounds/modern_notification.wav">Modern Notification</option>
                            <option value="/sounds/linear.wav">Linear Style</option>
                            <option value="/sounds/stripe.wav">Stripe Style</option>
                          </select>
                          <button
                            onClick={() => {
                              audioPlayer.play(notifSettings.soundsByType[type.key as keyof typeof notifSettings.soundsByType], notifSettings.volume);
                            }}
                            className="p-2 border border-black/10 dark:border-white/10 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          >
                            ▶️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                        {lang === 'ar' ? 'مستوى الصوت' : 'Volume Level'}
                      </label>
                      <select 
                        value={notifSettings.volume}
                        onChange={(e) => {
                          const newVol = e.target.value as any;
                          setNotifSettings({ ...notifSettings, volume: newVol });
                          audioPlayer.play(notifSettings.soundUrl, newVol);
                        }}
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Low">{lang === 'ar' ? 'منخفض' : 'Low'}</option>
                        <option value="Medium">{lang === 'ar' ? 'متوسط' : 'Medium'}</option>
                        <option value="High">{lang === 'ar' ? 'مرتفع' : 'High'}</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl">
                      <input 
                        type="checkbox" 
                        checked={notifSettings.isMuted}
                        onChange={(e) => setNotifSettings({ ...notifSettings, isMuted: e.target.checked })}
                        className="w-4 h-4 text-amber-500 bg-white border-zinc-300 rounded focus:ring-amber-500" 
                      />
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {lang === 'ar' ? 'كتم الإشعارات' : 'Mute Notifications'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl">
                      <input 
                        type="checkbox" 
                        checked={notifSettings.vibrate}
                        onChange={(e) => setNotifSettings({ ...notifSettings, vibrate: e.target.checked })}
                        className="w-4 h-4 text-amber-500 bg-white border-zinc-300 rounded focus:ring-amber-500" 
                      />
                      <span className="font-bold text-zinc-900 dark:text-white">
                        {lang === 'ar' ? 'الاهتزاز' : 'Vibrate on Notification'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-white text-zinc-900 dark:bg-[#0d060b] dark:text-white border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-3 mb-4 shrink-0">
                <div>
                  <span className="text-[9px] luxury-tracking text-amber-600 dark:text-amber-400 font-extrabold uppercase flex items-center gap-1.5">
                    <Sparkles size={11} />
                    {editingId ? (lang === 'ar' ? 'تحديث بيانات المنتج' : 'UPDATE ITEM') : (lang === 'ar' ? 'إضافة عنصر جديد للكتالوج' : 'NEW CATALOG ITEM')}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white mt-0.5">
                    {editingId ? (lang === 'ar' ? 'تعديل المنتج' : 'EDIT PRODUCT') : (lang === 'ar' ? 'إضافة منتج جديد' : 'ADD NEW PRODUCT')}
                  </h3>
                </div>
                <button 
                  onClick={resetForm} 
                  className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body - Scrollable */}
              <form onSubmit={handleAddProduct} className="flex-1 overflow-y-auto pr-1 pl-0.5 space-y-3.5 text-xs">
                {/* Product Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'اسم المنتج *' : 'PRODUCT NAME *'}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="E.G. OVERSIZED HEAVYWEIGHT HOODIE"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors uppercase"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'التصنيف' : 'CATEGORY'}
                    </label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-[#150a12] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="TOPS">TOPS</option>
                      <option value="BOTTOMS">BOTTOMS</option>
                      <option value="OUTERWEAR">OUTERWEAR</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock Row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col h-full gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 min-h-[2rem] flex items-end">
                      {lang === 'ar' ? 'سعر البيع (ج.م) *' : 'SELLING PRICE (EGP) *'}
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1200"
                      className="mt-auto w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col h-full gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 min-h-[2rem] flex items-end leading-tight">
                      {lang === 'ar' ? 'السعر الاصلي (لخصم)' : 'ORIGINAL PRICE (DISCOUNT)'}
                    </label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="1500"
                      className="mt-auto w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col h-full gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 min-h-[2rem] flex items-end">
                      {lang === 'ar' ? 'سعر التكلفة (ج.م)' : 'COST PRICE (EGP)'}
                    </label>
                    <input
                      type="number"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="650"
                      className="mt-auto w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col h-full gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400 min-h-[2rem] flex items-end">
                      {lang === 'ar' ? 'كمية المخزون' : 'STOCK QTY'}
                    </label>
                    <input
                      type="number"
                      value={stockInput}
                      onChange={(e) => setStockInput(e.target.value)}
                      placeholder="25"
                      className="mt-auto w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Profit Preview Banner */}
                {price && Number(price) > 0 && (
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                    <span>{lang === 'ar' ? 'ربح القطعة المتوقع:' : 'ESTIMATED UNIT PROFIT:'} +{(Number(price) - (costPrice ? Number(costPrice) : Math.round(Number(price) * 0.55))).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    <span>
                      {lang === 'ar' ? 'الهامش:' : 'MARGIN:'} {Math.round(((Number(price) - (costPrice ? Number(costPrice) : Math.round(Number(price) * 0.55))) / Number(price)) * 100)}%
                    </span>
                  </div>
                )}

                {/* SKU, Gender, Visibility */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'رمز التخزين (SKU)' : 'SKU CODE'}
                    </label>
                    <input
                      type="text"
                      value={skuInput}
                      onChange={(e) => setSkuInput(e.target.value)}
                      placeholder="SKU-A7-001"
                      className="w-full bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors uppercase"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'النوع' : 'GENDER'}
                    </label>
                    <select 
                      value={gender} 
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-[#150a12] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="Unisex">UNISEX</option>
                      <option value="Men">MEN</option>
                      <option value="Women">WOMEN</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                      {lang === 'ar' ? 'حالة الظهور' : 'VISIBILITY'}
                    </label>
                    <select
                      value={visibilityInput}
                      onChange={(e) => setVisibilityInput(e.target.value as 'Published' | 'Draft')}
                      className="w-full bg-zinc-50 dark:bg-[#150a12] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                    >
                      <option value="Published">{lang === 'ar' ? 'منشور (Published)' : 'Published'}</option>
                      <option value="Draft">{lang === 'ar' ? 'مسودة (Draft)' : 'Draft'}</option>
                    </select>
                  </div>
                </div>

                {/* Sizes Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase luxury-tracking text-zinc-500 dark:text-zinc-400">
                    {lang === 'ar' ? 'المقاسات المتاحة' : 'AVAILABLE SIZES'}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'OS'].map(sz => (
                      <button
                        type="button"
                        key={sz}
                        onClick={() => {
                          setSizesInput(prev => 
                            prev.includes(sz) ? prev.filter(s => s !== sz) : [...prev, sz]
                          );
                        }}
                        className={`flex items-center justify-center py-2 rounded-lg text-xs font-bold font-mono transition-all border cursor-pointer ${
                          sizesInput.includes(sz)
                            ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                            : 'bg-zinc-50 dark:bg-white/5 text-zinc-500 border-black/10 dark:border-white/10 hover:border-amber-500/50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi-Image Upload & Brand Gallery Manager Box */}
                <div className="flex flex-col gap-3 p-4 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase luxury-tracking text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <ImageIcon size={13} />
                      {lang === 'ar' ? 'معرض صور المنتج (متعدد الصور)' : 'PRODUCT MULTI-IMAGE GALLERY'}
                    </label>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      {imagesList.length} {lang === 'ar' ? 'صور مضافة' : 'IMAGES'}
                    </span>
                  </div>

                  {/* Drag-and-drop / Multi file Upload Trigger */}
                  <label className="cursor-pointer flex items-center justify-center gap-3 py-3 px-4 border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 transition-all text-center rounded-xl group">
                    <Upload className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex flex-col text-left rtl:text-right">
                      <span className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase">
                        {lang === 'ar' ? 'رفع صورة أو عدة صور من الجهاز' : 'UPLOAD MULTIPLE IMAGES'}
                      </span>
                      <span className="text-[9px] text-zinc-400 dark:text-white/40 font-mono">
                        {lang === 'ar' ? 'يمكنك تحديد عدة صور معاً (PNG, JPG, WEBP)' : 'Select multiple image files at once'}
                      </span>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handleProductImageFileUpload} className="hidden" />
                  </label>

                  {/* Option to add individual URL */}
                  <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <input
                      type="url"
                      value={newImageUrlInput}
                      onChange={(e) => setNewImageUrlInput(e.target.value)}
                      placeholder={lang === 'ar' ? 'أدخل رابط صورة مباشر...' : 'Enter direct image URL...'}
                      className="flex-1 bg-transparent border-b border-black/20 dark:border-white/20 pb-1 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 py-1 bg-amber-500 text-black text-[10px] font-bold uppercase rounded hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
                    >
                      {lang === 'ar' ? 'إضافة' : 'ADD'}
                    </button>
                  </div>

                  {/* Thumbnails list preview */}
                  {imagesList.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase luxury-tracking">
                        {lang === 'ar' ? 'الصور المضافة (الصورة الأولى هي الغلاف الرئيسي):' : 'ATTACHED PHOTOS (FIRST PHOTO IS MAIN COVER):'}
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {imagesList.map((img, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-black/10 dark:border-white/10 aspect-square bg-black/5">
                            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                            
                            {/* Main badge for first image */}
                            {idx === 0 ? (
                              <span className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow uppercase">
                                {lang === 'ar' ? 'الرئيسية' : 'MAIN'}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="absolute top-1 left-1 bg-black/70 hover:bg-amber-500 hover:text-black text-white text-[8px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >
                                {lang === 'ar' ? 'اجعلها الرئيسية' : 'SET MAIN'}
                              </button>
                            )}

                            {/* Delete image button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImageFromList(idx)}
                              className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                              title={lang === 'ar' ? 'حذف هذه الصورة' : 'Remove photo'}
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mark as NEW Checkbox & Sold Out Switch */}
                <div className="flex flex-row items-center justify-between gap-3 p-2.5 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isNew} 
                      onChange={(e) => setIsNew(e.target.checked)} 
                      className="appearance-none w-4 h-4 border border-black/30 dark:border-white/20 checked:bg-amber-500 checked:border-amber-500 transition-colors flex justify-center items-center relative before:content-[''] before:absolute before:w-2 before:h-2 before:bg-black before:opacity-0 checked:before:opacity-100 rounded" 
                    />
                    <span className="uppercase text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                      {lang === 'ar' ? 'شارة "NEW"' : "MARK 'NEW'"}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
                      <AlertTriangle size={13} />
                      {lang === 'ar' ? 'نفذت الكمية' : 'Sold Out'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSoldOut(!isSoldOut)}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                        isSoldOut ? 'bg-rose-600' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          isSoldOut ? 'translate-x-4 rtl:-translate-x-4' : 'translate-x-0.5 rtl:-translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Submit Action Buttons (Inside Form / Footer) */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/10 dark:border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 font-bold text-xs uppercase text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'CANCEL'}
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-bold text-xs uppercase flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {editingId ? <Edit2 size={13} /> : <Plus size={13} />} 
                    {editingId ? (lang === 'ar' ? 'حفظ التغييرات' : 'SAVE CHANGES') : (lang === 'ar' ? 'إضافة المنتج' : 'ADD PRODUCT')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL (رسالة تأكيد قبل الحذف النهائي) */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-[#0F0F0F] text-zinc-900 dark:text-white border border-rose-500/30 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative"
            >
              <button
                onClick={() => setDeleteTarget(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:text-white/50 dark:hover:text-white p-1"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase luxury-tracking">
                    {lang === 'ar' ? 'تأكيد الحذف النهائي' : 'CONFIRM PERMANENT DELETION'}
                  </h3>
                  <span className="text-[10px] luxury-tracking text-zinc-500 dark:text-white/50 block font-medium">PERMANENT DELETE WARNING</span>
                </div>
              </div>

              <div className="text-xs luxury-tracking text-zinc-600 dark:text-white/80 leading-relaxed bg-rose-500/5 p-4 border border-rose-500/10 font-medium">
                {lang === 'ar' ? (
                  <>
                    هل أنت متأكد من رغبتك في حذف <strong className="text-zinc-900 dark:text-white underline">{deleteTarget.name}</strong> بشكل نهائي؟
                    <p className="mt-2 text-[10px] text-rose-500/80 font-mono">هذا الإجراء لا يمكن التراجع عنه مطلقاً وسيتم إزالته من قاعدة البيانات.</p>
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete <strong className="text-zinc-900 dark:text-white underline">{deleteTarget.name}</strong>?
                    <p className="mt-2 text-[10px] text-rose-500/80 font-mono">This action cannot be undone and will be permanently removed from the database.</p>
                  </>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2 text-xs luxury-tracking">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-3 border border-black/10 dark:border-white/20 font-bold uppercase hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                >
                  {lang === 'ar' ? 'إلغاء' : 'CANCEL'}
                </button>
                <button
                  onClick={executeConfirmedDelete}
                  className="px-5 py-3 bg-rose-600 text-white font-bold uppercase hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-lg shadow-rose-600/20"
                >
                  <Trash2 size={14} /> {lang === 'ar' ? 'تأكيد الحذف النهائي' : 'CONFIRM DELETE'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK VIEW PRODUCT MODAL */}
      <AnimatePresence>
        {quickViewProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white text-zinc-900 dark:bg-[#0d060b] dark:text-white border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Eye size={12} />
                    {lang === 'ar' ? 'معاينة سريعة للمنتج' : 'PRODUCT QUICK VIEW'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
                    {quickViewProduct.name}
                  </h3>
                </div>
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                {/* Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-black/10 dark:border-white/10">
                  <img
                    src={quickViewProduct.image}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  {quickViewProduct.isNew && (
                    <span className="absolute top-3 left-3 text-[9px] font-black uppercase px-2 py-1 bg-amber-500 text-black rounded-md shadow-md">
                      NEW
                    </span>
                  )}
                </div>

                {/* Information List */}
                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase">
                      #{quickViewProduct.sku || `SKU-A7-${quickViewProduct.id.slice(0, 6).toUpperCase()}`}
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-zinc-900 dark:text-white">
                      {quickViewProduct.price.toLocaleString()} <span className="text-xs font-sans text-zinc-400">{lang === 'ar' ? 'ج.م' : 'EGP'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 font-mono">
                    <div>
                      <span className="text-[9px] font-sans text-zinc-400 uppercase block">{lang === 'ar' ? 'سعر التكلفة' : 'Cost Price'}</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300">
                        {(quickViewProduct.costPrice || Math.round(quickViewProduct.price * 0.55)).toLocaleString()} {lang === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-sans text-zinc-400 uppercase block">{lang === 'ar' ? 'هامش الربح' : 'Margin'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{(quickViewProduct.price - (quickViewProduct.costPrice || Math.round(quickViewProduct.price * 0.55))).toLocaleString()} EGP ({Math.round(((quickViewProduct.price - (quickViewProduct.costPrice || Math.round(quickViewProduct.price * 0.55))) / quickViewProduct.price) * 100)}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">{lang === 'ar' ? 'التصنيف:' : 'Category:'}</span>
                      <span className="font-bold">{quickViewProduct.category} ({quickViewProduct.gender})</span>
                    </div>

                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">{lang === 'ar' ? 'حالة المخزون:' : 'Stock Status:'}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {quickViewProduct.stock ?? 24} {lang === 'ar' ? 'قطعة متبقية' : 'Units remaining'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">{lang === 'ar' ? 'حالة الظهور:' : 'Visibility:'}</span>
                      <span className="font-bold">{quickViewProduct.visibility || 'Published'}</span>
                    </div>

                    <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                      <span className="text-[10px] uppercase font-bold text-zinc-400">{lang === 'ar' ? 'آخر تحديث:' : 'Last Updated:'}</span>
                      <span className="font-mono text-zinc-400">{quickViewProduct.lastUpdated || 'Aug 03, 2026'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-black/10 dark:border-white/10 mt-2">
                    <button
                      onClick={() => {
                        const target = quickViewProduct;
                        setQuickViewProduct(null);
                        handleEditClick(target);
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Edit2 size={14} />
                      <span>{lang === 'ar' ? 'تعديل هذا المنتج' : 'EDIT PRODUCT'}</span>
                    </button>
                    <button
                      onClick={() => setQuickViewProduct(null)}
                      className="px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/10 font-bold text-xs uppercase text-zinc-600 dark:text-zinc-300 cursor-pointer"
                    >
                      {lang === 'ar' ? 'إغلاق' : 'CLOSE'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
