const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    'useState("");\\n  const [profileBio',
    'useState("");\n  const [profileBio'
);

fs.writeFileSync('src/App.tsx', code);
