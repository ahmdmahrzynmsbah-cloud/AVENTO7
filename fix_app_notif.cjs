const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  '  saveUser,\n  defaultSettings\n} from \'./lib/db\';',
  '  saveUser,\n  defaultSettings,\n  subscribeAdminNotifications\n} from \'./lib/db\';'
);

const effectToAdd = `
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      const unsub = subscribeAdminNotifications(
        (notifs) => {
          // We don't need to store all notifications globally yet, AdminPanel handles it.
        },
        (newNotif) => {
          if ("Notification" in window && Notification.permission === "granted") {
            const title = newNotif.title || 'Avento7: New Order';
            const body = newNotif.body || 'A new order has been received!';
            const notification = new Notification(title, {
              body,
              // icon: '/icon.png',
            });
            
            // Try to play a subtle sound if available or standard beep
            try {
              // Creating a simple beep sound using AudioContext
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = 'sine';
              oscillator.frequency.value = 880; // A5
              gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
              oscillator.start(audioCtx.currentTime);
              oscillator.stop(audioCtx.currentTime + 0.5);
            } catch (e) {
              console.log("Could not play sound", e);
            }
          }
        }
      );
      
      return () => unsub();
    }
  }, [currentUser]);
`;

// Find where to insert the useEffect, perhaps right after `const [currentUser, ...]`
const insertTarget = "const [currentUser, setCurrentUser] = useState<User | null>(null);";
app = app.replace(insertTarget, insertTarget + "\n" + effectToAdd);

fs.writeFileSync('src/App.tsx', app);
console.log("Updated App.tsx with notifications");
