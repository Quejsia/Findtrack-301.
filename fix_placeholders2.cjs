const fs = require('fs');
let content = fs.readFileSync('src/components/SubmissionForm.tsx', 'utf8');

content = content.replace(
  /placeholder="e\.g\. What color sticker is on the back\? \/ Can you name the keychain brand\?"/g,
  "placeholder={t('generated.string_535')}"
);
content = content.replace(
  /placeholder="e\.g\. Jane Doe"/g,
  "placeholder={t('generated.string_536')}"
);
content = content.replace(
  /placeholder="e\.g\. janedoe@email\.com or \+1 \(555\) 019-2831"/g,
  "placeholder={t('generated.string_537')}"
);

fs.writeFileSync('src/components/SubmissionForm.tsx', content);
console.log("Fixed more placeholders");
