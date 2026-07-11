const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Search page replacements
const searchReplacements = [
  ["Find Lost Items", "{t('search.findLostItems')}"],
  ["Search through our community database to find what you're looking for.", "{t('search.searchThroughOurCommunityDatabaseToFindWhatYouReLookingFor')}"],
  ['placeholder="Search by keywords, brands, or descriptions..."', 'placeholder={t("search.searchByKeywordsBrandsOrDescriptions")}'],
  [">STATUS<", ">{t('search.status')}<"],
  [">All Items<", ">{t('search.allItems')}<"],
  [">LOCATION<", ">{t('search.location')}<"],
  ['placeholder="Type location..."', 'placeholder={t("search.typeLocation")}'],
  ["Search Results (", "{t('search.searchResultsStart')}"],
  [" found)", "{t('search.searchResultsEnd')}"],
  [">View Details<", ">{t('search.viewDetails')}<"],
  [">View details<", ">{t('search.viewDetails')}<"]
];

for (const [from, to] of searchReplacements) {
  app = app.replace(from, to);
}

// 2. Profile page replacements
const profileReplacements = [
  [">Community Member<", ">{t('profile.communityMember')}<"],
  [">Location not set<", ">{t('profile.locationNotSet')}<"],
  [">Update your profile to add a bio.<", ">{t('profile.updateYourProfileToAddABio')}<"],
  [">Edit Profile<", ">{t('profile.editProfile')}<"],
  [">Impact Stats<", ">{t('profile.impactStats')}<"],
  [">Items Reported<", ">{t('profile.itemsReported')}<"],
  [">Reunited<", ">{t('profile.reunited')}<"],
  [">Personal Information<", ">{t('profile.personalInformation')}<"],
  [">Display Name<", ">{t('profile.displayName')}<"],
  [">Bio<", ">{t('profile.bio')}<"],
  ['placeholder="Tell the community a bit about yourself..."', 'placeholder={t("generated.string_431")}'], // Already there or fallback
  [">Email Address<", ">{t('profile.emailAddress')}<"],
  [">Email verified<", ">{t('profile.emailVerified')}<"],
  [">Phone Number<", ">{t('profile.phoneNumber')}<"],
  [">Primary Location<", ">{t('profile.primaryLocation')}<"],
  [">Save Changes<", ">{t('profile.saveChanges')}<"],
  [">Notification Preferences<", ">{t('profile.notificationPreferences')}<"],
  [">New matches for my items<", ">{t('profile.newMatchesForMyItems')}<"],
  [">Get notified when a found item matches your report.<", ">{t('profile.getNotifiedWhenAFoundItemMatchesYourReport')}<"],
  [">Community Alerts<", ">{t('profile.communityAlerts')}<"],
  [">Important alerts in your primary location.<", ">{t('profile.importantAlertsInYourPrimaryLocation')}<"],
  [">Security<", ">{t('profile.security')}<"],
  [">Change Password<", ">{t('profile.changePassword')}<"],
  [">Update your security credentials<", ">{t('profile.updateYourSecurityCredentials')}<"],
  [">Sign Out Everywhere<", ">{t('profile.signOutEverywhere')}<"],
];

for (const [from, to] of profileReplacements) {
  app = app.replace(from, to);
}

fs.writeFileSync('src/App.tsx', app);
console.log("App.tsx replaced.");

// 3. ItemDetail.tsx
let itemDetail = fs.readFileSync('src/components/ItemDetail.tsx', 'utf8');

const itemDetailReplacements = [
  [">Back to Results<", ">{t('itemDetail.backToResults')}<"],
  [">Ref #<", ">{t('itemDetail.ref')}<"],
  [">Gemini AI Matchmaker<", ">{t('itemDetail.geminiAiMatchmaker')}<"],
  [">Scanning local databases...<", ">{t('itemDetail.scanningLocalDatabases')}<"],
  [">Item Details<", ">{t('itemDetail.itemDetails')}<"],
  [">Category<", ">{t('itemDetail.category')}<"],
  [">Date Logged<", ">{t('itemDetail.dateLogged')}<"],
  [">Location<", ">{t('itemDetail.location')}<"],
  [">Description<", ">{t('itemDetail.description')}<"],
  [">Contact Credentials<", ">{t('itemDetail.contactCredentials')}<"],
  [">Reporter<", ">{t('itemDetail.reporter')}<"],
  [">Contact Chat Room<", ">{t('itemDetail.contactChatRoom')}<"],
  [">Log Ownership Claim<", ">{t('itemDetail.logOwnershipClaim')}<"]
];

// Ensure useTranslation is there
if (!itemDetail.includes("useTranslation")) {
  itemDetail = itemDetail.replace(
    /import React, \{ useState, useEffect, useRef \} from 'react';/,
    "import React, { useState, useEffect, useRef } from 'react';\nimport { useTranslation } from 'react-i18next';"
  );
  itemDetail = itemDetail.replace(
    /export default function ItemDetail\(\{(.*?)\}\) \{/,
    "export default function ItemDetail({$1}) {\n  const { t } = useTranslation();"
  );
}

for (const [from, to] of itemDetailReplacements) {
  itemDetail = itemDetail.replace(from, to);
}

fs.writeFileSync('src/components/ItemDetail.tsx', itemDetail);
console.log("ItemDetail.tsx replaced.");

// 4. SubmissionForm.tsx
let subForm = fs.readFileSync('src/components/SubmissionForm.tsx', 'utf8');
const subFormReplacements = [
  [">I am reporting a...<", ">{t('report.iAmReportingA')}<"],
  [">Lost Item<", ">{t('report.lostItem')}<"],
  [">Found Item<", ">{t('report.foundItem')}<"],
  [">Item Title<", ">{t('report.itemTitle')}<"],
  [">Location Lost<", ">{t('report.locationLost')}<"],
  [">Location Found<", ">{t('report.locationFound')}<"],
  [">Continue<", ">{t('report.continue')}<"]
];

if (!subForm.includes("useTranslation")) {
  subForm = subForm.replace(
    /import React, \{ useState, useEffect, useRef \} from 'react';/,
    "import React, { useState, useEffect, useRef } from 'react';\nimport { useTranslation } from 'react-i18next';"
  );
  subForm = subForm.replace(
    /export default function SubmissionForm\(\{(.*?)\}\) \{/,
    "export default function SubmissionForm({$1}) {\n  const { t } = useTranslation();"
  );
}

for (const [from, to] of subFormReplacements) {
  subForm = subForm.replace(from, to);
}

fs.writeFileSync('src/components/SubmissionForm.tsx', subForm);
console.log("SubmissionForm.tsx replaced.");
