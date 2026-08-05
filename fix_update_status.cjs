const fs = require('fs');
let db = fs.readFileSync('src/lib/db.ts', 'utf8');

const target = `export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db: firestoreDb } = await import('./firebase');
    const docRef = doc(firestoreDb, 'orders', orderId);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error("updateOrderStatus error", err);
  }
}`;

const replace = `export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db: firestoreDb } = await import('./firebase');
    const docRef = doc(firestoreDb, 'orders', orderId);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error("updateOrderStatus firebase error, falling back to local storage", err);
    try {
      const local = localStorage.getItem('unknown_orders');
      if (local) {
        let orders = JSON.parse(local);
        const index = orders.findIndex((o: any) => o.id === orderId);
        if (index !== -1) {
          orders[index].status = status;
          localStorage.setItem('unknown_orders', JSON.stringify(orders));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}`;

db = db.replace(target, replace);
fs.writeFileSync('src/lib/db.ts', db);
