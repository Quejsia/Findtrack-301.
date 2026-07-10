const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /<span className="material-symbols-outlined text-\[40px\] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>lock<\/span>/,
  '<Lock className="h-10 w-10 text-on-tertiary-container" fill="currentColor" strokeWidth={1.5} />'
);

app = app.replace(
  /<span className="material-symbols-outlined text-\[18px\]" style={{ fontVariationSettings: "'FILL' 0" }}>login<\/span>/,
  '<LogIn className="h-[18px] w-[18px]" strokeWidth={2} />'
);

app = app.replace(
  /<span className="material-symbols-outlined text-\[18px\]" style={{ fontVariationSettings: "'FILL' 0" }}>person_add<\/span>/,
  '<UserPlus className="h-[18px] w-[18px]" strokeWidth={2} />'
);

fs.writeFileSync('src/App.tsx', app);
