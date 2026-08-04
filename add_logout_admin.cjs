const fs = require('fs');

let admin = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add prop to interface
admin = admin.replace(
  '  onBackToStore: () => void;',
  '  onBackToStore: () => void;\n  onLogout?: () => void;'
);

// 2. Destructure prop
admin = admin.replace(
  '  onBackToStore,\n  currentUser,',
  '  onBackToStore,\n  onLogout,\n  currentUser,'
);

// 3. Add to mobile header
const mobileHeaderTarget = `                      <ArrowLeft size={14} className="rtl:rotate-180" />
                      <span className="text-[10px]">{lang === 'ar' ? 'المتجر' : 'STORE'}</span>
                    </button>`;
const mobileHeaderReplacement = `                      <ArrowLeft size={14} className="rtl:rotate-180" />
                      <span className="text-[10px]">{lang === 'ar' ? 'المتجر' : 'STORE'}</span>
                    </button>
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="lg:hidden p-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-900/30 transition-colors flex items-center gap-1 cursor-pointer"
                        title={lang === 'ar' ? 'تسجيل الخروج' : 'LOGOUT'}
                      >
                        <LogOut size={14} />
                      </button>
                    )}`;
admin = admin.replace(mobileHeaderTarget, mobileHeaderReplacement);

// 4. Add to sidebar footer
const sidebarFooterTarget = `              >
                <ArrowLeft size={16} className={isSidebarCollapsed ? "mx-auto rtl:rotate-180" : "rtl:rotate-180"} />
                {!isSidebarCollapsed && <span className="uppercase">{lang === 'ar' ? 'المتجر الرئيسي' : 'STOREFRONT'}</span>}
              </button>`;
const sidebarFooterReplacement = `              >
                <ArrowLeft size={16} className={isSidebarCollapsed ? "mx-auto rtl:rotate-180" : "rtl:rotate-180"} />
                {!isSidebarCollapsed && <span className="uppercase">{lang === 'ar' ? 'المتجر الرئيسي' : 'STOREFRONT'}</span>}
              </button>
              {onLogout && (
                <button 
                  onClick={onLogout} 
                  title={lang === 'ar' ? 'تسجيل الخروج' : 'LOGOUT'}
                  className={\`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 transition-all border border-rose-200 dark:border-rose-800 cursor-pointer \${
                    isSidebarCollapsed ? 'px-2' : ''
                  }\`}
                >
                  <LogOut size={16} className={isSidebarCollapsed ? "mx-auto" : ""} />
                  {!isSidebarCollapsed && <span className="uppercase">{lang === 'ar' ? 'تسجيل الخروج' : 'LOGOUT'}</span>}
                </button>
              )}`;
admin = admin.replace(sidebarFooterTarget, sidebarFooterReplacement);

fs.writeFileSync('src/components/AdminPanel.tsx', admin);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  '              onDeleteProduct={handleDeleteProduct}',
  '              onDeleteProduct={handleDeleteProduct}\n              onLogout={handleLogout}'
);
fs.writeFileSync('src/App.tsx', app);

console.log("Logout added to AdminPanel");
