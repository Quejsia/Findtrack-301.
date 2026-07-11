const fs = require('fs');
let content = fs.readFileSync('src/components/SubmissionForm.tsx', 'utf8');

content = content.replace(
  />Lost Item</g,
  ">{t('report.lostItem')}<"
);
content = content.replace(
  />Found Item</g,
  ">{t('report.foundItem')}<"
);

fs.writeFileSync('src/components/SubmissionForm.tsx', content);
console.log("Fixed sub form strings");
