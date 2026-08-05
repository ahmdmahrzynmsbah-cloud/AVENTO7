const fs = require('fs');
let db = fs.readFileSync('src/lib/db.ts', 'utf8');

if (!db.includes('export async function updateOrderStatus')) {
  db += `
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db: firestoreDb } = await import('./firebase');
    const docRef = doc(firestoreDb, 'orders', orderId);
    await updateDoc(docRef, { status });
  } catch (err) {
    console.error("updateOrderStatus error", err);
  }
}
`;
  fs.writeFileSync('src/lib/db.ts', db);
  console.log("Added updateOrderStatus");
} else {
  console.log("updateOrderStatus already exists");
}
