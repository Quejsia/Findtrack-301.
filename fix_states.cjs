const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const profileNameStr = 'const [profileName, setProfileName] = useState("Student");';
const addition = `const [profileLocation, setProfileLocation] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const markAlertRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllAlertsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
`;

code = code.replace(profileNameStr, profileNameStr + '\\n  ' + addition);
fs.writeFileSync('src/App.tsx', code);
console.log('Fixed states');
