const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  />Reunited<\/span>/g,
  ">{t('profile.reunited')}<\/span>"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Fixed reunited");
