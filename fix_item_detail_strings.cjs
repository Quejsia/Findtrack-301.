const fs = require('fs');
let content = fs.readFileSync('src/components/ItemDetail.tsx', 'utf8');

content = content.replace(
  /← Back to Results/g,
  "← {t('itemDetail.backToResults')}"
);
content = content.replace(
  /<span>Log Ownership Claim<\/span>/g,
  "<span>{t('itemDetail.logOwnershipClaim')}</span>"
);
content = content.replace(
  /<span>Contact Chat Room<\/span>/g,
  "<span>{t('itemDetail.contactChatRoom')}</span>"
);

fs.writeFileSync('src/components/ItemDetail.tsx', content);
console.log("Fixed remaining item detail strings");
