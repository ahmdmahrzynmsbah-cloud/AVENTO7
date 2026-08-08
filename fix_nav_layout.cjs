const fs = require('fs');
let code = fs.readFileSync('src/components/CustomerDashboard.tsx', 'utf8');

const targetStr = `          {/* Navigation Items */}
          <nav className="bg-white dark:bg-[#0A0A0A] border border-wine/10 dark:border-white/10 p-1.5 sm:p-2 flex overflow-x-auto hide-scrollbar lg:flex-col gap-1.5 shadow-sm scroll-smooth">
            <button
              onClick={() => setActiveTab('overview')}`;

const replacementStr = `          {/* Navigation Items */}
          <nav className="bg-white dark:bg-[#0A0A0A] border border-wine/10 dark:border-white/10 p-1.5 sm:p-2 flex flex-col gap-1.5 shadow-sm scroll-smooth">
            <button
              onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}`;

code = code.replace(targetStr, replacementStr);

const targetStr2 = `            <button
              onClick={() => setActiveTab('orders')}`;

const replacementStr2 = `            <button
              onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}`;

code = code.replace(targetStr2, replacementStr2);

const targetStr3 = `            <button
              onClick={() => setActiveTab('addresses')}`;

const replacementStr3 = `            <button
              onClick={() => { setActiveTab('addresses'); setIsSidebarOpen(false); }}`;

code = code.replace(targetStr3, replacementStr3);

const targetStr4 = `            <button
              onClick={() => setActiveTab('profile')}`;

const replacementStr4 = `            <button
              onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}`;

code = code.replace(targetStr4, replacementStr4);

fs.writeFileSync('src/components/CustomerDashboard.tsx', code);
