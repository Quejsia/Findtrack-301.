const fs = require('fs');
let content = fs.readFileSync('src/components/SubmissionForm.tsx', 'utf8');

content = content.replace(
  /placeholder="e\.g\. Broken House Key with red ring"/g,
  "placeholder={t('generated.string_532')}"
);
content = content.replace(
  /placeholder="e\.g\. Central Park East Ground near bench"/g,
  "placeholder={t('generated.string_533')}"
);
content = content.replace(
  /placeholder="Introduce specific markings, brands, tags, texture shapes, material details \(e\.g\. brass keys, engraved 'Home' on back\)\.\.\."/g,
  "placeholder={t('generated.string_534')}"
);

fs.writeFileSync('src/components/SubmissionForm.tsx', content);
console.log("Fixed placeholders");
