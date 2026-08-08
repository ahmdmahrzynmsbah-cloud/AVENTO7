const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const targetStr = `        {/* Left Action: SHOP Dropdown & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-4 z-10 shrink-0">`;

const replacementStr = `        {/* Left Action: SHOP Dropdown & Mobile Menu */}
        <div className="flex flex-1 items-center gap-2 sm:gap-4 z-10 shrink-0">`;

code = code.replace(targetStr, replacementStr);

const targetStr2 = `        {/* Center: Brand Logo (Absolutely Centered) */}
        <div className="absolute inset-x-0 mx-auto flex justify-center items-center text-center z-10 pointer-events-none overflow-hidden">
          <a href="#" className="inline-block text-center pointer-events-auto">`;

const replacementStr2 = `        {/* Center: Brand Logo */}
        <div className="flex flex-shrink-0 justify-center items-center text-center z-10 overflow-hidden mx-2">
          <a href="#" className="inline-block text-center">`;

code = code.replace(targetStr2, replacementStr2);

const targetStr3 = `        {/* Right Actions: Icons ONLY (No text) */}
        <div className="flex items-center gap-0 sm:gap-2 justify-end z-10 shrink-0">`;

const replacementStr3 = `        {/* Right Actions: Icons ONLY (No text) */}
        <div className="flex flex-1 items-center gap-0 sm:gap-2 justify-end z-10 shrink-0">`;

code = code.replace(targetStr3, replacementStr3);

fs.writeFileSync('src/components/Navbar.tsx', code);
