const fs = require('fs');
let content = fs.readFileSync('src/components/SubmissionForm.tsx', 'utf8');

content = content.replace(
  />Report Missing or Found Item</g,
  ">{t('generated.string_509')}<"
);

fs.writeFileSync('src/components/SubmissionForm.tsx', content);
console.log("Fixed report title");
