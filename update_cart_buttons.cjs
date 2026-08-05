const fs = require('fs');
let cart = fs.readFileSync('src/components/CartDrawer.tsx', 'utf8');
const tgTarget = `            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🖨️ طباعة الفاتورة (Print Invoice)", url: \`\${window.location.origin}/?print_order=\${newOrder.id}\` }
                ]
              ]
            }`;
const tgReplace = `            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ تأكيد الطلب", callback_data: \`confirm_\${newOrder.id}\` },
                  { text: "❌ إلغاء الطلب", callback_data: \`cancel_\${newOrder.id}\` }
                ],
                [
                  { text: "🖨️ طباعة الفاتورة", url: \`\${window.location.origin}/?print_order=\${newOrder.id}\` }
                ]
              ]
            }`;
if (cart.includes('طباعة الفاتورة (Print Invoice)')) {
  cart = cart.replace(tgTarget, tgReplace);
  fs.writeFileSync('src/components/CartDrawer.tsx', cart);
  console.log('Cart buttons updated');
} else {
  console.log('Target not found');
}
