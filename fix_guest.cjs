const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    'if (profileName === "Guest" && ["report", "analytics", "settings"].includes(item.id)) {',
    'if (profileName === "Guest" && ["report", "analytics", "profile", "myitems", "pinned"].includes(item.id)) {'
);

fs.writeFileSync('src/App.tsx', code);
