import React, { useEffect, useState } from 'react';
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
      }, 800);
    }
  }, [order, loading]);

  if (loading) return <div className="p-10 text-center font-sans">Loading Invoice...</div>;
  if (!order) return <div className="p-10 text-center text-red-500 font-sans">Order not found.</div>;

  return (
    <div className="bg-white text-black min-h-screen p-4 sm:p-8 max-w-4xl mx-auto font-sans print:p-0 print:m-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-[3px] border-black pb-6 mb-8 gap-6 sm:gap-0">
        <div className="w-full sm:w-auto text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none">{settings.storeName || 'Store'}</h1>
          <p className="text-sm font-bold text-gray-500 tracking-widest uppercase mt-2">Invoice / Receipt</p>
        </div>
        <div className="w-full flex flex-col items-center sm:w-auto sm:items-end">
          <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${order.id}&scale=2&height=10`} alt="Barcode" className="h-12 w-auto mb-2 mix-blend-multiply" />
          <p className="text-xs sm:text-sm font-bold tracking-widest">{order.id}</p>
          <p className="text-xs text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-10">
        <div className="bg-gray-50 p-5 sm:p-6 border border-gray-100 rounded-xl text-center sm:text-left">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Billed To</h3>
          <p className="font-bold text-lg leading-tight mb-1">{order.customerName}</p>
          <p className="text-sm text-gray-600 mb-1" dir="ltr">{order.customerPhone}</p>
          {order.customerEmail && <p className="text-sm text-gray-600">{order.customerEmail}</p>}
        </div>
        <div className="bg-gray-50 p-5 sm:p-6 border border-gray-100 rounded-xl text-center sm:text-left">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Shipped To</h3>
          <p className="font-bold text-lg leading-tight mb-1">{order.governorate}</p>
          <p className="text-sm text-gray-600 leading-relaxed max-w-[250px] mx-auto sm:mx-0">{order.address}</p>
        </div>
      </div>

      {/* Items Table - Desktop & Print */}
      <div className="hidden sm:block">
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-[3px] border-black text-left">
              <th className="py-3 text-[11px] font-black tracking-wider uppercase text-gray-500">Item</th>
              <th className="py-3 text-[11px] font-black tracking-wider uppercase text-gray-500 text-center">Size</th>
              <th className="py-3 text-[11px] font-black tracking-wider uppercase text-gray-500 text-center">Qty</th>
              <th className="py-3 text-[11px] font-black tracking-wider uppercase text-gray-500 text-right">Price</th>
              <th className="py-3 text-[11px] font-black tracking-wider uppercase text-gray-500 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-5 font-bold text-sm max-w-[200px]">{item.name}</td>
                <td className="py-5 text-center text-sm font-semibold text-gray-600">{item.size || '-'}</td>
                <td className="py-5 text-center text-sm font-semibold">{item.quantity}</td>
                <td className="py-5 text-right text-sm text-gray-600">{item.price.toLocaleString()} EGP</td>
                <td className="py-5 text-right text-sm font-black">{(item.price * item.quantity).toLocaleString()} EGP</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Items List - Mobile Only */}
      <div className="block sm:hidden mb-8 border-t-2 border-black pt-4">
        <h3 className="text-[11px] font-black tracking-wider uppercase text-gray-500 mb-4 text-center">Order Items</h3>
        {order.items.map((item, idx) => (
          <div key={idx} className="border-b border-gray-200 py-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="font-bold text-sm leading-tight pr-4">{item.name}</p>
              <p className="font-black text-sm whitespace-nowrap">{(item.price * item.quantity).toLocaleString()} EGP</p>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
              <p className="bg-gray-100 px-2 py-1 rounded font-bold text-black border border-gray-200">Size: {item.size || '-'}</p>
              <p className="font-semibold">{item.quantity} x {item.price.toLocaleString()} EGP</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex justify-end mt-4">
        <div className="w-full sm:w-1/2 lg:w-2/5">
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
            <span className="font-bold">{(order.totalAmount - order.shippingFee + (order.discountAmount || 0)).toLocaleString()} EGP</span>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Shipping</span>
            <span className="font-bold">{order.shippingFee.toLocaleString()} EGP</span>
          </div>
          {order.discountAmount ? (
            <div className="flex justify-between py-3 border-b border-gray-200 text-red-600">
              <span className="text-sm font-bold uppercase tracking-wider">Discount ({order.appliedCoupon})</span>
              <span className="font-bold">-{order.discountAmount.toLocaleString()} EGP</span>
            </div>
          ) : null}
          <div className="flex justify-between py-5 border-b-[3px] border-black mt-2">
            <span className="text-xl font-black uppercase tracking-wider">Total</span>
            <span className="text-xl font-black">{order.totalAmount.toLocaleString()} EGP</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-sm font-bold uppercase tracking-widest mb-2">Thank you for your business</p>
        <p className="text-xs text-gray-500" dir="ltr">
          Contact us: <span className="font-semibold text-black">{settings.supportPhone || '01022293420'}</span>
        </p>
      </div>
    </div>
  );
}
