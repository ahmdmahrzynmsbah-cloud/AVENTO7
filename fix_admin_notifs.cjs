const fs = require('fs');

// 1. Update db.ts
let db = fs.readFileSync('src/lib/db.ts', 'utf8');

const targetDb = `export const subscribeAdminNotifications = (callback: (notifications: import('../types').AdminNotification[]) => void) => {
  const q = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: typeof doc.data().createdAt?.toDate === 'function' ? doc.data().createdAt.toDate().toISOString() : (doc.data().createdAt || new Date().toISOString())
    })) as import('../types').AdminNotification[];
    callback(notifs);
  }, (error) => {
    console.error('Error fetching admin notifications', error);
  });
};`;

const replacementDb = `export const subscribeAdminNotifications = (
  callback: (notifications: import('../types').AdminNotification[]) => void,
  onNewNotification?: (notification: import('../types').AdminNotification) => void
) => {
  const q = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'));
  let isFirstLoad = true;
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: typeof doc.data().createdAt?.toDate === 'function' ? doc.data().createdAt.toDate().toISOString() : (doc.data().createdAt || new Date().toISOString())
    })) as import('../types').AdminNotification[];
    
    callback(notifs);

    if (onNewNotification && !isFirstLoad) {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
           const newNotif = {
             id: change.doc.id,
             ...change.doc.data(),
             createdAt: typeof change.doc.data().createdAt?.toDate === 'function' ? change.doc.data().createdAt.toDate().toISOString() : (change.doc.data().createdAt || new Date().toISOString())
           } as import('../types').AdminNotification;
           onNewNotification(newNotif);
        }
      });
    }
    
    isFirstLoad = false;
  }, (error) => {
    console.error('Error fetching admin notifications', error);
  });
};`;

db = db.replace(targetDb, replacementDb);
fs.writeFileSync('src/lib/db.ts', db);

console.log("Updated db.ts");
