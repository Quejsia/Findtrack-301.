const fs = require('fs');
let content = fs.readFileSync('src/components/SubmissionForm.tsx', 'utf8');

content = content.replace(
  /\n\s*Lost Item\s*\n/g,
  "\n              {t('report.lostItem')}\n"
);
content = content.replace(
  /\n\s*Found Item\s*\n/g,
  "\n              {t('report.foundItem')}\n"
);
content = content.replace(
  />Item Title</g,
  ">{t('report.itemTitle')}<"
);
content = content.replace(
  />Location Lost</g,
  ">{t('report.locationLost')}<"
);
content = content.replace(
  />Location Found</g,
  ">{t('report.locationFound')}<"
);
content = content.replace(
  />Continue</g,
  ">{t('report.continue')}<"
);

fs.writeFileSync('src/components/SubmissionForm.tsx', content);
console.log("Fixed whitespace issues in sub form");
