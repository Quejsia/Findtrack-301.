const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '<main className="flex-1 overflow-y-auto bg-surface-container-low p-4 md:p-6 lg:p-8 relative">',
    '<main className="flex-1 overflow-y-auto bg-surface-container-low p-4 pb-28 md:p-6 lg:p-8 relative">'
);

fs.writeFileSync('src/App.tsx', code);
