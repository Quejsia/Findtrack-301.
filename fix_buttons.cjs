const fs = require('fs');
let content = fs.readFileSync('src/components/ItemDetail.tsx', 'utf8');

content = content.replace(
  />Encrypting\.\.\.</g,
  ">{t('generated.string_494')}<"
);
content = content.replace(
  /Submit Secure Claim/g,
  "{t('generated.string_495')}"
);
content = content.replace(
  />\s*Cancel\s*</g,
  ">\n                    {t('generated.string_511')} {/* Close/Cancel */}\n                  <"
);
// There is also "Cancel" with spaces maybe, let's just use string replacement on exact match.
fs.writeFileSync('src/components/ItemDetail.tsx', content);
console.log("Fixed button strings");
