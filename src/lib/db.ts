import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  orderBy
} from './firebase';

export { db, collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy };
import { Product, Order, User, StoreSettings, RestockNotification } from '../types';
import { products as initialProducts } from '../data';
import { getDefaultShippingRates } from '../constants/governorates';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const SETTINGS_COLLECTION = 'settings';
const GENERAL_SETTINGS_DOC = 'general';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const defaultSettings: StoreSettings = {
  heroImages: [
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&q=80&w=2560",
    "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=2560",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2560",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=2560",
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=2560"
  ],
  offers: [
    "FREE SHIPPING ON ORDERS OVER 3,000 EGP",
    "NEW MENSWEAR SS26 COLLECTION NOW LIVE",
    "COMPLIMENTARY RETURNS WITHIN 30 DAYS"
  ],
  shippingRates: getDefaultShippingRates(),
  defaultShippingRate: 50,
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com'
  }
};

// --- PRODUCTS ---
export function subscribeProducts(onUpdate: (products: Product[]) => void) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty) {
      // Seed initial products if database empty
      initialProducts.forEach(p => {
        setDoc(doc(db, PRODUCTS_COLLECTION, p.id), p).catch(console.error);
      });
      onUpdate(initialProducts);
    } else {
      const items: Product[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      onUpdate(items);
    }
  }, (err) => {
    console.error('Products listener error:', err);
  });
}

export async function saveProduct(product: Product) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, product, { merge: true });
  } catch (err) {
    console.error('Error saving product to Firestore:', err);
  }
}

export async function deleteProduct(id: string) {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
  } catch (err) {
    console.error('Error deleting product from Firestore:', err);
  }
}

// --- ORDERS ---
export function subscribeOrders(onUpdate: (orders: Order[]) => void) {
  const colRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const items: Order[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onUpdate(items);
  }, (err) => {
    console.error('Orders listener error:', err);
  });
}

export async function saveOrder(order: Order) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, order, { merge: true });
  } catch (err) {
    console.error('Error saving order to Firestore:', err);
  }
}

export async function deleteOrder(id: string) {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, id));
  } catch (err) {
    console.error('Error deleting order from Firestore:', err);
  }
}

// --- USERS / REGISTERED CUSTOMERS ---
export function subscribeUsers(onUpdate: (users: (User & { password?: string })[]) => void) {
  const colRef = collection(db, USERS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    if (snapshot.empty) {
      // Seed default user demo if empty
      const demoUser = {
        id: 'user-demo-1',
        name: 'Ahmed Hassan',
        email: 'ahmed@gmail.com',
        phone: '01012345678',
        password: 'password123',
        role: 'user' as const,
        createdAt: new Date().toISOString()
      };
      setDoc(doc(db, USERS_COLLECTION, demoUser.id), demoUser).catch(console.error);
      onUpdate([demoUser]);
    } else {
      const items: (User & { password?: string })[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as User & { password?: string });
      });
      onUpdate(items);
    }
  }, (err) => {
    console.error('Users listener error:', err);
  });
}

export async function saveUser(user: User & { password?: string }) {
  try {
    const docRef = doc(db, USERS_COLLECTION, user.id);
    await setDoc(docRef, user, { merge: true });
  } catch (err) {
    console.error('Error saving user to Firestore:', err);
  }
}

export async function deleteUser(id: string) {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, id));
  } catch (err) {
    console.error('Error deleting user from Firestore:', err);
  }
}

// --- STORE SETTINGS ---
export function subscribeSettings(onUpdate: (settings: StoreSettings) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as StoreSettings);
    } else {
      // Seed default settings
      setDoc(docRef, defaultSettings).catch(console.error);
      onUpdate(defaultSettings);
    }
  }, (err) => {
    console.error('Settings listener error:', err);
  });
}

export async function saveSettings(settings: StoreSettings) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_SETTINGS_DOC);
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
  }
}

// --- NOTIFICATIONS ---
export function subscribeNotifications(onUpdate: (notifications: RestockNotification[]) => void) {
  const colRef = collection(db, NOTIFICATIONS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const items: RestockNotification[] = [];
    snapshot.forEach(docSnap => {
      items.push({ id: docSnap.id, ...docSnap.data() } as RestockNotification);
    });
    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onUpdate(items);
  }, (err) => {
    console.error('Notifications listener error:', err);
  });
}

export async function addNotificationRequest(
  data: Omit<RestockNotification, 'id' | 'createdAt' | 'notified'> & { id?: string }
) {
  try {
    const notifId = data.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const notifDoc: RestockNotification = {
      id: notifId,
      userId: data.userId,
      userEmail: data.userEmail || '',
      userName: data.userName || '',
      userPhone: data.userPhone || '',
      productId: data.productId,
      productName: data.productName,
      createdAt: new Date().toISOString(),
      notified: false
    };
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notifId);
    await setDoc(docRef, notifDoc, { merge: true });
    return notifDoc;
  } catch (err) {
    console.error('Error adding notification request:', err);
    throw err;
  }
}

export async function triggerNotificationsForProduct(productId: string, productName?: string): Promise<number> {
  try {
    const colRef = collection(db, NOTIFICATIONS_COLLECTION);
    const snapshot = await getDocs(colRef);
    let count = 0;
    const now = new Date().toISOString();

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as RestockNotification;
      if (data.productId === productId && !data.notified) {
        await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, docSnap.id), {
          notified: true,
          notifiedAt: now
        });
        count++;
      }
    }
    return count;
  } catch (err) {
    console.error('Error triggering notifications for product:', err);
    return 0;
  }
}

export async function deleteNotification(id: string) {
  try {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, id));
  } catch (err) {
    console.error('Error deleting notification:', err);
  }
}

export const addRestockNotification = addNotificationRequest;
export const triggerRestockNotificationsForProduct = triggerNotificationsForProduct;
export const deleteRestockNotification = deleteNotification;


export const subscribeAdminNotifications = (callback: (notifications: import('../types').AdminNotification[]) => void) => {
  const q = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    })) as import('../types').AdminNotification[];
    callback(notifs);
  }, (error) => {
    console.error('Error fetching admin notifications', error);
  });
};

export const markNotificationAsRead = async (id: string) => {
  try {
    await updateDoc(doc(db, 'adminNotifications', id), { isRead: true });
  } catch (error) {
    console.error('Error marking notification read', error);
  }
};

export const markAllNotificationsAsRead = async (notifications: import('../types').AdminNotification[]) => {
  try {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => updateDoc(doc(db, 'adminNotifications', n.id), { isRead: true })));
  } catch (error) {
    console.error('Error marking all read', error);
  }
};
