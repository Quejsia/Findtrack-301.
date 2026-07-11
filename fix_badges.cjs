const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /\{r\.type === "lost" \? "LOST" : "FOUND"\}/g,
  "{r.type === 'lost' ? t('search.lost').toUpperCase() : t('search.found').toUpperCase()}"
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed LOST/FOUND badges');
