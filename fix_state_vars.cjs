const fs = require('fs');

let authModal = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');
authModal = authModal.replace(/isLoading/g, 'loading');
fs.writeFileSync('src/components/AuthModal.tsx', authModal);

let itemDetail = fs.readFileSync('src/components/ItemDetail.tsx', 'utf8');
itemDetail = itemDetail.replace(/claimAnswer/g, 'answer');
itemDetail = itemDetail.replace(/setClaimAnswer/g, 'setAnswer');
itemDetail = itemDetail.replace(/isSubmitting/g, 'submittingClaim');
fs.writeFileSync('src/components/ItemDetail.tsx', itemDetail);

