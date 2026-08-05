const fs = require('fs');
let panel = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!panel.includes('notifSettingsRef')) {
  // insert ref
  const target = `  const [notifSettings, setNotifSettings] = useState<import('../types').AdminNotificationSettings>(
    currentUser?.notificationSettings || defaultNotifSettings
  );`;
  const replacement = `  const [notifSettings, setNotifSettings] = useState<import('../types').AdminNotificationSettings>(
    currentUser?.notificationSettings || defaultNotifSettings
  );
  const notifSettingsRef = React.useRef(notifSettings);
  React.useEffect(() => {
    notifSettingsRef.current = notifSettings;
  }, [notifSettings]);`;
  panel = panel.replace(target, replacement);

  // use ref in subscribeAdminNotifications
  const hookTarget = `        if (!notifSettings.isMuted) {
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
        }`;
  const hookReplacement = `        const currentNotifSettings = notifSettingsRef.current;
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
        }`;
  panel = panel.replace(hookTarget, hookReplacement);

  const hookTarget2 = `      if (!notifSettings.isMuted) {
        // Try playing sound based on type if passed in data
        let soundUrl = notifSettings.soundUrl;
        const type = payload.data?.type;
        if (type === 'NEW_ORDER') soundUrl = notifSettings.soundsByType.newOrder || soundUrl;
        else if (type === 'PAYMENT_CONFIRMED') soundUrl = notifSettings.soundsByType.paymentConfirmed || soundUrl;
        else if (type === 'ORDER_CANCELLED') soundUrl = notifSettings.soundsByType.orderCancelled || soundUrl;
        else if (type === 'LOW_STOCK') soundUrl = notifSettings.soundsByType.lowStock || soundUrl;
        else if (type === 'NEW_CUSTOMER') soundUrl = notifSettings.soundsByType.newCustomer || soundUrl;
        
        audioPlayer.play(soundUrl, notifSettings.volume);
      }
      
      if (notifSettings.vibrate && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }`;
  const hookReplacement2 = `      const currentNotifSettings = notifSettingsRef.current;
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
      }`;
  panel = panel.replace(hookTarget2, hookReplacement2);

  fs.writeFileSync('src/components/AdminPanel.tsx', panel);
  console.log("AdminPanel notifSettingsRef added");
}
