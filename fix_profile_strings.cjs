const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  ["Community Member", "{t('profile.communityMember')}"],
  ["Location not set", "{t('profile.locationNotSet')}"],
  ["Update your profile to add a bio.", "{t('profile.updateYourProfileToAddABio')}"],
  ["Edit Profile", "{t('profile.editProfile')}"],
  ["Email Address", "{t('profile.emailAddress')}"],
  ["Email verified", "{t('profile.emailVerified')}"],
  ["Save Changes", "{t('profile.saveChanges')}"],
  ["Sign Out Everywhere", "{t('profile.signOutEverywhere')}"],
  ["Phone Number", "{t('profile.phoneNumber')}"]
];

for (const [from, to] of replacements) {
  // Be careful to replace only where it's textual in UI
  app = app.replace(new RegExp(`>${from}<`, 'g'), `>${to}<`);
  app = app.replace(new RegExp(`>\\s*${from}\\s*<`, 'g'), `>${to}<`);
  app = app.replace(new RegExp(`"${from}"`, 'g'), `"${to}"`);
  app = app.replace(new RegExp(`'${from}'`, 'g'), `'${to}'`);
}

// Phone Number (Optional) label
app = app.replace(
  />Phone Number \(Optional\)</g,
  ">{t('profile.phoneNumber')} (Optional)<"
);

// Fallbacks where they are not bounded by brackets
app = app.replace(
  /{profileLocation \|\| "Location not set"}/g,
  "{profileLocation || t('profile.locationNotSet')}"
);
app = app.replace(
  /{profileBio \|\| "Update your profile to add a bio."}/g,
  "{profileBio || t('profile.updateYourProfileToAddABio')}"
);

app = app.replace(
  /Community Members/g,
  "{t('profile.communityMember')}s" // In the dashboard
);

fs.writeFileSync('src/App.tsx', app);
console.log("Fixed remaining profile strings");
