const fs = require('fs');
let cart = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');

const target = `      // Save order to Firestore & localStorage
      await saveOrder(newOrder);

      // Trigger admin notification
      await addAdminNotification({`;

const replacement = `      // Save order to Firestore & localStorage
      await saveOrder(newOrder);

      // Send Telegram Notification
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
      }

      // Trigger admin notification
      await addAdminNotification({`;

cart = cart.replace(target, replacement);

fs.writeFileSync('src/components/CartDrawer.tsx', cart);
console.log("CartDrawer updated with Telegram");
