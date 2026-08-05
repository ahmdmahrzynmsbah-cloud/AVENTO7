const fs = require('fs');

// 1. Create PrintInvoice.tsx
const printInvoiceCode = `import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Order, StoreSettings } from '../types';

interface PrintInvoiceProps {
  orderId: string;
  settings: StoreSettings;
}

export default function PrintInvoice({ orderId, settings }: PrintInvoiceProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        } else {
          // Fallback to local storage if not in Firebase
          const local = localStorage.getItem('unknown_orders');
          if (local) {
            const parsed = JSON.parse(local);
            const found = parsed.find((o: Order) => o.id === orderId);
            if (found) setOrder(found);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (order && !loading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [order, loading]);

  if (loading) return <div className="p-10 text-center">Loading Invoice...</div>;
  if (!order) return <div className="p-10 text-center text-red-500">Order not found.</div>;

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-3xl mx-auto font-sans">
      <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">{settings.storeName || 'Store'}</h1>
          <p className="text-sm text-gray-500 mt-1">Invoice / Receipt</p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <img src={\`https://bwipjs-api.metafloor.com/?bcid=code128&text=\${order.id}&scale=2&height=10\`} alt="Barcode" className="h-12 ml-auto" />
          </div>
          <p className="text-sm font-bold">{order.id}</p>
          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Billed To</h3>
          <p className="font-bold text-lg">{order.customerName}</p>
          <p className="text-sm">{order.customerPhone}</p>
          <p className="text-sm">{order.customerEmail}</p>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Shipped To</h3>
          <p className="font-bold">{order.governorate}</p>
          <p className="text-sm max-w-[200px]">{order.address}</p>
        </div>
      </div>

      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2 text-xs font-bold uppercase">Item</th>
            <th className="py-2 text-xs font-bold uppercase text-center">Size</th>
            <th className="py-2 text-xs font-bold uppercase text-center">Qty</th>
            <th className="py-2 text-xs font-bold uppercase text-right">Price</th>
            <th className="py-2 text-xs font-bold uppercase text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-200">
              <td className="py-4 font-medium">{item.name}</td>
              <td className="py-4 text-center">{item.size || '-'}</td>
              <td className="py-4 text-center">{item.quantity}</td>
              <td className="py-4 text-right">{item.price.toLocaleString()} EGP</td>
              <td className="py-4 text-right font-bold">{(item.price * item.quantity).toLocaleString()} EGP</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/2">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm">Subtotal</span>
            <span className="font-bold">{(order.totalAmount - order.shippingFee + (order.discountAmount || 0)).toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm">Shipping</span>
            <span className="font-bold">{order.shippingFee.toLocaleString()} EGP</span>
          </div>
          {order.discountAmount ? (
            <div className="flex justify-between py-2 border-b border-gray-200 text-red-600">
              <span className="text-sm">Discount ({order.appliedCoupon})</span>
              <span className="font-bold">-{order.discountAmount.toLocaleString()} EGP</span>
            </div>
          ) : null}
          <div className="flex justify-between py-4 border-b-2 border-black">
            <span className="text-lg font-black uppercase">Total</span>
            <span className="text-lg font-black">{order.totalAmount.toLocaleString()} EGP</span>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-sm text-gray-500">
        <p>Thank you for shopping with us!</p>
        <p>If you have any questions, please contact {settings.supportPhone || settings.supportEmail || 'support'}</p>
      </div>
    </div>
  );
}`;
fs.writeFileSync('src/components/PrintInvoice.tsx', printInvoiceCode);

// 2. Modify App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');

if (!app.includes("import PrintInvoice")) {
  app = app.replace(
    "import AdminPanel from './components/AdminPanel';", 
    "import AdminPanel from './components/AdminPanel';\nimport PrintInvoice from './components/PrintInvoice';"
  );
}

if (!app.includes("const [printOrderId")) {
  const stateTarget = "const [customerTab, setCustomerTab] = useState<'overview' | 'orders' | 'profile' | 'addresses'>('orders');";
  const stateReplace = `const [customerTab, setCustomerTab] = useState<'overview' | 'orders' | 'profile' | 'addresses'>('orders');
  const [printOrderId, setPrintOrderId] = useState<string | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('print_order');
    if (pid) {
      setPrintOrderId(pid);
    }
  }, []);`;
  app = app.replace(stateTarget, stateReplace);
}

const viewTarget = "{viewMode === 'store' && (";
const viewReplace = `{printOrderId ? (
          <PrintInvoice orderId={printOrderId} settings={storeSettings} />
        ) : viewMode === 'store' && (`;
if (app.includes(viewTarget) && !app.includes("printOrderId ?")) {
  app = app.replace(viewTarget, viewReplace);
}

const mainTarget = '<main className="flex-1 w-full flex flex-col">';
const mainReplace = '<main className={printOrderId ? "hidden" : "flex-1 w-full flex flex-col"}>';
if (app.includes(mainTarget)) {
  app = app.replace(mainTarget, mainReplace);
}

// 3. Modify CartDrawer.tsx Telegram Notification
let cart = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');
const tgTarget = `// Send Telegram Notification
      if (storeSettings?.telegramBotToken && storeSettings?.telegramChatId) {
        const text = \`🔔 *New Order Received!*\\n\\n*Order ID:* \\\`\${newOrder.id}\\\`\\n*Customer:* \${name}\\n*Phone:* \${phone}\\n*Total:* \${totalAmount.toLocaleString()} EGP\`;
        fetch(\`https://api.telegram.org/bot\${storeSettings.telegramBotToken}/sendMessage\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: storeSettings.telegramChatId,
            text,
            parse_mode: 'Markdown'
          })
        }).catch(err => console.error("Telegram error:", err));
      }`;

const tgReplace = `// Send Telegram Notification
      if (storeSettings?.telegramBotToken && storeSettings?.telegramChatId) {
        const productList = cartItems.map(i => \`• \${i.name} (\${i.size}) x\${i.quantity} - \${i.price} EGP\`).join('\\n');
        const text = \`<b>🆕 طلب جديد (New Order)</b>
━━━━━━━━━━━━━━━━━
<b>📦 رقم الطلب:</b> <code>\${newOrder.id}</code>
<b>👤 العميل:</b> \${name}
<b>📱 الهاتف:</b> \${phone}
<b>📍 المحافظة:</b> \${governorate}
<b>🏠 العنوان:</b> \${address}
━━━━━━━━━━━━━━━━━
<b>🛒 المنتجات:</b>
\${productList}

<b>💰 الإجمالي:</b> <b>\${totalAmount.toLocaleString()} EGP</b>\`;
        
        fetch(\`https://api.telegram.org/bot\${storeSettings.telegramBotToken}/sendMessage\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: storeSettings.telegramChatId,
            text,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🖨️ طباعة الفاتورة (Print Invoice)", url: \`\${window.location.origin}/?print_order=\${newOrder.id}\` }
                ]
              ]
            }
          })
        }).catch(err => console.error("Telegram error:", err));
      }`;

if (cart.includes("🔔 *New Order")) {
  cart = cart.replace(tgTarget, tgReplace);
  fs.writeFileSync('src/components/CartDrawer.tsx', cart);
}

fs.writeFileSync('src/App.tsx', app);
console.log("Invoice feature and Telegram formatted message added.");
