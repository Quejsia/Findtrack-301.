const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace('} , AlertTriangle', ', AlertTriangle');
code = code.replace('useState("Student");\\n  const', 'useState("Student");\n  const');

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed again');
