const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /t\('search\.lost'\)\.toUpperCase\(\)/g,
  "t('dashboard.lost').toUpperCase()"
);
app = app.replace(
  /t\('search\.found'\)\.toUpperCase\(\)/g,
  "t('dashboard.found').toUpperCase()"
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed LOST/FOUND to dashboard.lost');
