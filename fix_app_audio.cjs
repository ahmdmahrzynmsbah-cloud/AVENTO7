const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes("import { unlockAudio }")) {
  app = app.replace("import { StrictMode, useEffect, useState, useRef } from 'react';", "import { StrictMode, useEffect, useState, useRef } from 'react';\nimport { unlockAudio } from './lib/audioUnlocker';");
  app = app.replace("<div className=\"font-sans text-zinc-950 dark:text-zinc-50 min-h-screen flex flex-col selection:bg-amber-200 selection:text-amber-900\">", "<div className=\"font-sans text-zinc-950 dark:text-zinc-50 min-h-screen flex flex-col selection:bg-amber-200 selection:text-amber-900\" onClick={() => unlockAudio()}>");
  fs.writeFileSync('src/App.tsx', app);
}
console.log("Audio unlock added");
