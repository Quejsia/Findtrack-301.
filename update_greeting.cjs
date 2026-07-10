const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const greetingLogic = `
  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'greeting.morning';
    } else if (hour >= 12 && hour < 18) {
      return 'greeting.afternoon';
    } else {
      return 'greeting.evening';
    }
  };
`;

// Insert the logic just inside the App component, let's say after `const { t } = useTranslation();`
app = app.replace(
  /const \{ t \} = useTranslation\(\);/,
  "const { t } = useTranslation();" + greetingLogic
);

app = app.replace(
  /Magandang araw 👋/,
  "{t(getGreetingKey())}"
);

fs.writeFileSync('src/App.tsx', app);
console.log('App.tsx updated.');
