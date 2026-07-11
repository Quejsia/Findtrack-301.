const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  ["Items<br/>Reported", "{t('dashboard.itemsReported')}"], // actually the JSX is "Items<br/>Reported:" but let's replace "Items<br/>Reported" or just the whole block
  ["Community<br/>Members:", "{t('dashboard.communityMembers')}:"],
  ["Recoveries<br/>This Week:", "{t('dashboard.recoveriesThisWeek')}:"],
  ["Items<br/>Found:", "{t('dashboard.itemsFound')}:"],
  [">Recent Community Activity<", ">{t('dashboard.recentCommunityActivity')}<"],
  [">Private Messages<", ">{t('dashboard.privateMessages')}<"],
  [">No messages yet<", ">{t('dashboard.noMessagesYet')}<"],
  [">When someone contacts you about your reported item, it will appear here.<", ">{t('dashboard.whenSomeoneContactsYouAboutYourReportedItemItWillAppearHere')}<"],
  [">Report an Item<", ">{t('dashboard.reportAnItem')}<"],
  [">Fill in the details below. Our smart matching system will help find the owner or the item.<", ">{t('dashboard.fillInTheDetailsBelowOurSmartMatchingSystemWillHelpFindTheOwnerOrTheItem')}<"],
  [">1. Basic Info<", ">{t('dashboard.1BasicInfo')}<"],
  [">2. Details<", ">{t('dashboard.2Details')}<"],
  [">3. Verification<", ">{t('dashboard.3Verification')}<"],
  [">No recent activity.<", ">{t('dashboard.noRecentActivity')}<"],
  [">Every recovered item strengthens the community.<", ">{t('dashboard.everyRecoveredItemStrengthensTheCommunity')}<"],
];

for (const [from, to] of replacements) {
  app = app.replace(from, to);
}

// Special case for Items Reported and Found that have <br/> inside them
app = app.replace(
  /<div className="text-sm font-medium text-\[#15605A\] leading-tight mb-1">Items<br\/>Reported:<\/div>/g,
  '<div className="text-sm font-medium text-[#15605A] leading-tight mb-1">{t(\'dashboard.itemsReported\')}:</div>'
);
app = app.replace(
  /<div className="text-sm font-medium text-\[#15605A\] leading-tight mb-1">Items<br\/>Found:<\/div>/g,
  '<div className="text-sm font-medium text-[#15605A] leading-tight mb-1">{t(\'dashboard.itemsFound\')}:</div>'
);
app = app.replace(
  /<div className="text-sm font-medium text-\[#15605A\] leading-tight mb-1">Community<br\/>Members:<\/div>/g,
  '<div className="text-sm font-medium text-[#15605A] leading-tight mb-1">{t(\'dashboard.communityMembers\')}:</div>'
);
app = app.replace(
  /<div className="text-sm font-medium text-\[#15605A\] leading-tight mb-1">Recoveries<br\/>This Week:<\/div>/g,
  '<div className="text-sm font-medium text-[#15605A] leading-tight mb-1">{t(\'dashboard.recoveriesThisWeek\')}:</div>'
);
app = app.replace(
  /r\.type === 'lost' \? 'Lost' : 'Found'/g,
  "r.type === 'lost' ? t('dashboard.lost') : t('dashboard.found')"
);

fs.writeFileSync('src/App.tsx', app);
console.log("Replaced dashboard strings.");
