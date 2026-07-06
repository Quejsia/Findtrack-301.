const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// replace @import url(...) with the new fonts
css = css.replace(
  /@import url\('https:\/\/fonts\.googleapis\.com\/css2[^']+'\);/,
  "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');"
);

fs.writeFileSync('src/index.css', css);
