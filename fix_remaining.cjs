const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /\n\s*Every recovered item strengthens the community\.\s*\n/g,
  "\n                {t('dashboard.everyRecoveredItemStrengthensTheCommunity')}\n"
);
app = app.replace(
  /\n\s*1\. Basic Info\s*\n/g,
  "\n                      {t('dashboard.1BasicInfo')}\n"
);
app = app.replace(
  /\n\s*2\. Details\s*\n/g,
  "\n                      {t('dashboard.2Details')}\n"
);
app = app.replace(
  /\n\s*3\. Verification\s*\n/g,
  "\n                      {t('dashboard.3Verification')}\n"
);
fs.writeFileSync('src/App.tsx', app);
console.log('Fixed remaining dashboard strings.');
