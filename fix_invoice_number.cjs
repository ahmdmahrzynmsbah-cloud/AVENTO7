const fs = require('fs');
let content = fs.readFileSync('src/components/PrintInvoice.tsx', 'utf8');

const target = `{/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-sm font-bold uppercase tracking-widest mb-2">Thank you for your business</p>
        {(settings.supportPhone || settings.supportEmail) && (
          <p className="text-xs text-gray-500" dir="ltr">
            Contact us: <span className="font-semibold text-black">{settings.supportPhone || settings.supportEmail}</span>
          </p>
        )}
      </div>`;
      
const replacement = `{/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-sm font-bold uppercase tracking-widest mb-2">Thank you for your business</p>
        <p className="text-xs text-gray-500" dir="ltr">
          Contact us: <span className="font-semibold text-black">{settings.supportPhone || '01022293420'}</span>
        </p>
      </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/PrintInvoice.tsx', content);
console.log("Updated footer in invoice");
