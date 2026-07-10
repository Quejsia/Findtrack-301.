const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /<input \n                    type="text" \n                    placeholder="Search community..."\n                    className="pr-10 pl-4 py-2 bg-surface-container rounded-full text-sm border-none focus:ring-2 focus:ring-primary outline-none w-64 pointer-events-none"\n                      <Search className="absolute right-3 top-1\/2 -translate-y-1\/2 h-4 w-4 text-outline" \/>\n                    readOnly\n                  \/>/,
  `<input 
                    type="text" 
                    placeholder="Search community..."
                    className="pr-10 pl-4 py-2 bg-surface-container rounded-full text-sm border-none focus:ring-2 focus:ring-primary outline-none w-64 pointer-events-none"
                    readOnly
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />`
);
fs.writeFileSync('src/App.tsx', app);
