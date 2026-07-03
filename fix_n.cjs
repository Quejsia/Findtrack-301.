const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '<button onClick={() => { if (n.itemId) { setSelectedItemId(n.itemId); setActiveTab("itemDetail"); } }} className="text-secondary hover:underline font-label-md text-sm">View details</button>',
    '<button onClick={() => { if (notif.itemId) { setSelectedItemId(notif.itemId); setActiveTab("itemDetail"); } }} className="text-secondary hover:underline font-label-md text-sm">View details</button>'
);

fs.writeFileSync('src/App.tsx', code);
