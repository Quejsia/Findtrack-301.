const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/flex-1 flex flex-col min-w-0 bg-background overflow-y-auto/g, '');
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed');
