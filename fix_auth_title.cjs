const fs = require('fs');
let auth = fs.readFileSync('src/components/AuthPage.tsx', 'utf8');

const h2Target = 'className="serif-display text-2xl sm:text-3xl lg:text-4xl font-light tracking-wider uppercase text-[#30001A] dark:text-white mb-6 whitespace-nowrap"';
const h2Replacement = 'className="serif-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-widest uppercase text-[#30001A] dark:text-white mb-6 flex flex-row items-center gap-2 whitespace-nowrap"';

auth = auth.replace(h2Target, h2Replacement);

const h1Target = 'className="serif-display text-4xl xl:text-5xl font-light tracking-wide leading-tight uppercase"';
const h1Replacement = 'className="serif-display text-3xl md:text-4xl xl:text-5xl font-light tracking-wide leading-tight uppercase"';
auth = auth.replace(h1Target, h1Replacement);

fs.writeFileSync('src/components/AuthPage.tsx', auth);
console.log("Auth title updated");
