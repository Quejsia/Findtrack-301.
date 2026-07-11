const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /Search Results <span/g,
  "{t('search.searchResultsStart')}<span"
);
app = app.replace(
  /View Details/g,
  "{t('search.viewDetails')}"
);
app = app.replace(
  /STATUS/g,
  "{t('search.status')}"
);
app = app.replace(
  /All Items/g,
  "{t('search.allItems')}"
);
app = app.replace(
  /LOCATION/g,
  "{t('search.location')}"
);

fs.writeFileSync('src/App.tsx', app);
console.log("Fixed remaining search strings");
