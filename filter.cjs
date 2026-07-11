const fs = require('fs');
const strings = JSON.parse(fs.readFileSync('strings.json'));
const filtered = strings.filter(s => {
  if (s.text.length <= 1) return false;
  if (!/[a-zA-Z]/.test(s.text)) return false;
  if (s.text.startsWith('bg-') || s.text.startsWith('text-') || s.text.includes('flex')) return false;
  return true;
}).map(s => s.text);
console.log(JSON.stringify(filtered, null, 2));
