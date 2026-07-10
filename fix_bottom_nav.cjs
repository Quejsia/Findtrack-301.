const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /<span className="text-\[11px\] font-semibold tracking-wide font-dmsans">Home<\/span>/,
  '<span className="text-[11px] font-semibold tracking-wide font-dmsans">{t(\'sidebar.home\')}</span>'
);

app = app.replace(
  /<span className="text-\[11px\] font-semibold tracking-wide font-dmsans">Search<\/span>/,
  '<span className="text-[11px] font-semibold tracking-wide font-dmsans">{t(\'sidebar.search\')}</span>'
);

app = app.replace(
  /<span className="text-\[11px\] font-semibold tracking-wide font-dmsans">Report<\/span>/,
  '<span className="text-[11px] font-semibold tracking-wide font-dmsans">{t(\'sidebar.reportItem\')}</span>'
);

app = app.replace(
  /<span className="text-\[11px\] font-semibold tracking-wide font-dmsans">Alerts<\/span>/,
  '<span className="text-[11px] font-semibold tracking-wide font-dmsans">{t(\'sidebar.alerts\')}</span>'
);

app = app.replace(
  /<span className="text-\[11px\] font-semibold tracking-wide font-dmsans">Profile<\/span>/,
  '<span className="text-[11px] font-semibold tracking-wide font-dmsans">{t(\'sidebar.profile\')}</span>'
);

fs.writeFileSync('src/App.tsx', app);
console.log('Bottom nav updated.');
