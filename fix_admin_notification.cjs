const fs = require('fs');
let panel = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const target = `    const unsubAdminNotifs = subscribeAdminNotifications((notifs) => {
      setAdminNotifications(notifs);
    });`;

const replacement = `    const unsubAdminNotifs = subscribeAdminNotifications(
      (notifs) => setAdminNotifications(notifs),
      (newNotif) => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(newNotif.title, { body: newNotif.body });
        }
        if (!notifSettings.isMuted) {
          let soundUrl = notifSettings.soundUrl;
          const type = newNotif.type;
          if (type === 'NEW_ORDER') soundUrl = notifSettings.soundsByType.newOrder || soundUrl;
          else if (type === 'PAYMENT_CONFIRMED') soundUrl = notifSettings.soundsByType.paymentConfirmed || soundUrl;
          else if (type === 'ORDER_CANCELLED') soundUrl = notifSettings.soundsByType.orderCancelled || soundUrl;
          else if (type === 'LOW_STOCK') soundUrl = notifSettings.soundsByType.lowStock || soundUrl;
          else if (type === 'NEW_CUSTOMER') soundUrl = notifSettings.soundsByType.newCustomer || soundUrl;
          
          audioPlayer.play(soundUrl, notifSettings.volume);
        }
        
        if (notifSettings.vibrate && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }
    );`;

panel = panel.replace(target, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', panel);
console.log("AdminPanel audio fixed");
