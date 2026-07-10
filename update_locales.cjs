const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
const greetings = {
  en: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
  fr: { morning: "Bonjour", afternoon: "Bon après-midi", evening: "Bonsoir" },
  zh: { morning: "早上好", afternoon: "下午好", evening: "晚上好" },
  fil: { morning: "Magandang umaga", afternoon: "Magandang hapon", evening: "Magandang gabi" },
  es: { morning: "Buenos días", afternoon: "Buenas tardes", evening: "Buenas noches" }
};

for (const [lang, translations] of Object.entries(greetings)) {
  const filePath = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.greeting = translations;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}
console.log('Locales updated.');
