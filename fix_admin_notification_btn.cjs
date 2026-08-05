const fs = require('fs');
let panel = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const target = `{lang === 'ar' ? 'إعدادات أصوات التنبيهات' : 'Push Notification Sounds'}`;
const replacement = `{lang === 'ar' ? 'إعدادات تنبيهات المتصفح' : 'Browser Notification Settings'}`;
panel = panel.replace(target, replacement);

const btnTarget = `<button 
                    onClick={() => {
                      if (!notifSettings.isMuted) {`;
const btnReplacement = `<button 
                    onClick={() => {
                      if ("Notification" in window && Notification.permission !== "granted") {
                        Notification.requestPermission();
                      }
                      if (!notifSettings.isMuted) {`;
panel = panel.replace(btnTarget, btnReplacement);

fs.writeFileSync('src/components/AdminPanel.tsx', panel);
