const fs = require('fs');
let content = fs.readFileSync('src/components/ItemDetail.tsx', 'utf8');

content = content.replace(
  /Direct Message Stream/g,
  "{t('generated.string_496')}"
);
content = content.replace(
  />Connecting SECURE server channels\.\.\.</g,
  ">{t('generated.string_497')}<"
);
content = content.replace(
  />Send a message</g,
  ">{t('generated.string_498')}<"
);
content = content.replace(
  />\s*Coordinate handoff spots, describe identification details in high accuracy, or exchange contact details\.\s*</g,
  ">\n                {t('generated.string_499')}\n              <"
);
content = content.replace(
  /placeholder="Type secure handoff messages\.\.\."/g,
  "placeholder={t('generated.string_446')}"
);
content = content.replace(
  />Method of contact</g,
  ">{t('generated.string_473')}<"
);

fs.writeFileSync('src/components/ItemDetail.tsx', content);
console.log("Fixed remaining strings in ItemDetail");
