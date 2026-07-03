const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetBioStr = '"Dedicated to keeping our community connected."';
code = code.replace(targetBioStr, '{profileBio || "Update your profile to add a bio."}');

const stateStr = 'const [profileLocation, setProfileLocation] = useState("");';
if (!code.includes('const [profileBio')) {
    code = code.replace(stateStr, stateStr + '\\n  const [profileBio, setProfileBio] = useState("");');
}

fs.writeFileSync('src/App.tsx', code);
