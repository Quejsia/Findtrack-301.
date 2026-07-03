const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* PANEL: (.*?) \*\/\}\n\s*<section\n\s*id="[^"]+"\n\s*className="(.*?)"/g;
let match;
while ((match = regex.exec(code)) !== null) {
  console.log(match[1] + ': ' + match[2]);
}
