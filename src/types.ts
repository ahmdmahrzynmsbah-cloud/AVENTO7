export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  costPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  images?: string[];
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  collectionName?: string;
  colorName?: string;
  colorHex?: string;
  material?: string;
  fit?: string;
  brand?: string;
  isNew?: boolean;
  isPreOrder?: boolean;
  rating?: number;
  reviews?: number;
  description?: string;
  descriptionAr?: string;
  sizes?: string[];
  sku?: string;
  stock?: number;
  status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  isSoldOut?: boolean;
  notifySubscribers?: string[];
  visibility?: 'Published' | 'Draft' | 'Archived';
  lastUpdated?: string;
}

export interface CartItem extends Product {
  quantity: number;
  size: string;
}

export interface AdminNotificationSettings {
  soundUrl: string;
  volume: 'Low' | 'Medium' | 'High';
  isMuted: boolean;
  vibrate: boolean;
  soundsByType: {
    newOrder: string;
    paymentConfirmed: string;
    orderShipped: string;
    orderCancelled: string;
    lowStock: string;
    newCustomer: string;
  };
}

export interface AdminNotification {
  id: string;
  type: 'NEW_ORDER' | 'PAYMENT_CONFIRMED' | 'ORDER_CANCELLED' | 'LOW_STOCK' | 'NEW_CUSTOMER';
  title: string;
  body: string;
  relatedId?: string; // e.g. orderId
  isRead: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  governorate?: string;
  address?: string;
  role: 'admin' | 'user';
  createdAt?: string;
  isArchived?: boolean;
  fcmTokens?: string[];
  notificationSettings?: AdminNotificationSettings;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 for 10% or 100 for 100 EGP
  minOrderAmount?: number;
  active: boolean;
  applicableProductId?: string;
  applicableProductName?: string;
  applicableCategory?: string;
}

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  governorate?: string;
  shippingFee?: number;
  appliedCoupon?: string;
  discountAmount?: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface StoreSettings {
  heroImages: string[];
  offers: string[];
  shippingRates?: Record<string, number>;
  defaultShippingRate?: number;
  coupons?: Coupon[];
  socialLinks?: SocialLinks;
  storeName?: string;
  supportEmail?: string;
  supportPhone?: string;
  currency?: string;
  freeShippingThreshold?: number;
  marqueeText?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  storeUrl?: string;
}

export interface RestockNotification {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  productId: string;
  productName: string;
  createdAt: string;
  notified: boolean;
  notifiedAt?: string;
}


