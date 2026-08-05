const fs = require('fs');
let panel = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const hookTarget = `  // Load Real Data from Firestore in Realtime
  useEffect(() => {
    if (currentUser?.id) {`;
const hookReplace = `  // Telegram Polling for Inline Buttons
  useEffect(() => {
    if (!settings?.telegramBotToken) return;
    
    let isPolling = true;
    let offset = 0;
    
    const poll = async () => {
      while (isPolling) {
        try {
          const res = await fetch(\`https://api.telegram.org/bot\${settings.telegramBotToken}/getUpdates?offset=\${offset}&timeout=30\`);
          if (!res.ok) throw new Error("Network response was not ok");
          const data = await res.json();
          
          if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
              offset = update.update_id + 1;
              if (update.callback_query) {
                const cb = update.callback_query;
                const actionData = cb.data; // confirm_ORD-... or cancel_ORD-...
                
                if (actionData.startsWith('confirm_') || actionData.startsWith('cancel_')) {
                  const action = actionData.split('_')[0];
                  const orderId = actionData.split('_')[1];
                  const newStatus = action === 'confirm' ? 'Confirmed' : 'Cancelled';
                  const alertText = action === 'confirm' ? 'تم تأكيد الطلب بنجاح ✅' : 'تم إلغاء الطلب ❌';
                  
                  // Update Firestore
                  import('../lib/db').then(({ updateOrderStatus }) => {
                    updateOrderStatus(orderId, newStatus).then(() => {
                      // Answer callback query
                      fetch(\`https://api.telegram.org/bot\${settings.telegramBotToken}/answerCallbackQuery\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          callback_query_id: cb.id,
                          text: alertText,
                          show_alert: true
                        })
                      }).catch(e => console.error(e));
                      
                      // Optionally update message to remove buttons
                      fetch(\`https://api.telegram.org/bot\${settings.telegramBotToken}/editMessageReplyMarkup\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          chat_id: cb.message.chat.id,
                          message_id: cb.message.message_id,
                          reply_markup: {
                            inline_keyboard: [
                              [
                                { text: "🖨️ طباعة الفاتورة", url: \`\${window.location.origin}/?print_order=\${orderId}\` }
                              ]
                            ]
                          }
                        })
                      }).catch(e => console.error(e));
                    });
                  });
                }
              }
            }
          }
        } catch (e) {
          console.error("Telegram polling error:", e);
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    };
    
    poll();
    
    return () => {
      isPolling = false;
    };
  }, [settings?.telegramBotToken]);

  // Load Real Data from Firestore in Realtime
  useEffect(() => {
    if (currentUser?.id) {`;

if (!panel.includes('Telegram Polling for Inline Buttons')) {
  panel = panel.replace(hookTarget, hookReplace);
  fs.writeFileSync('src/components/AdminPanel.tsx', panel);
  console.log('Polling added');
} else {
  console.log('Polling already exists');
}
