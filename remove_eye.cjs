const fs = require('fs');

let collection = fs.readFileSync('src/components/Collection.tsx', 'utf8');

// Replace the icon + text with just text
collection = collection.replace(
  '<Eye size={14} className="shrink-0" />\n                            <span className="truncate">{isRTL ? \'نظرة سريعة\' : \'QUICK VIEW\'}</span>',
  '<span className="truncate">{isRTL ? \'نظرة سريعة\' : \'QUICK VIEW\'}</span>'
);

collection = collection.replace(
  '<Bell size={14} className="text-amber-400 animate-bounce shrink-0" />\n                            <span className="truncate">{isRTL ? \'أبلغني بالتوفر\' : \'NOTIFY ME\'}</span>',
  '<span className="truncate">{isRTL ? \'أبلغني بالتوفر\' : \'NOTIFY ME\'}</span>'
);

fs.writeFileSync('src/components/Collection.tsx', collection);
console.log("Eye removed");
