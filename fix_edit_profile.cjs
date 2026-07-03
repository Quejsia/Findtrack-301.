const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '<button className="bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-variant px-4 py-2 rounded-lg font-label-md text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 w-full md:w-auto">',
    '<button onClick={() => document.getElementById("profName")?.focus()} className="bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-variant px-4 py-2 rounded-lg font-label-md text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 w-full md:w-auto">'
);

fs.writeFileSync('src/App.tsx', code);
