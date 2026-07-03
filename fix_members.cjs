const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('<div className="text-3xl font-bold text-[#1A7B72]">250+</div>', '<div className="text-3xl font-bold text-[#1A7B72]">{new Set(items.map(i => i.userId).filter(Boolean)).size || 1}</div>');

fs.writeFileSync('src/App.tsx', code);
