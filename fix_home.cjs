const fs = require('fs');

const fr = JSON.parse(fs.readFileSync('src/i18n/locales/fr.json', 'utf8'));
const zh = JSON.parse(fs.readFileSync('src/i18n/locales/zh.json', 'utf8'));
const fil = JSON.parse(fs.readFileSync('src/i18n/locales/fil.json', 'utf8'));
const es = JSON.parse(fs.readFileSync('src/i18n/locales/es.json', 'utf8'));

fr.sidebar.home = 'Accueil';
zh.sidebar.home = '首页';
fil.sidebar.home = 'Home'; // Or "Tahanan" but usually it's "Home" or "Pangunahin"
es.sidebar.home = 'Inicio';

fs.writeFileSync('src/i18n/locales/fr.json', JSON.stringify(fr, null, 2));
fs.writeFileSync('src/i18n/locales/zh.json', JSON.stringify(zh, null, 2));
fs.writeFileSync('src/i18n/locales/fil.json', JSON.stringify(fil, null, 2));
fs.writeFileSync('src/i18n/locales/es.json', JSON.stringify(es, null, 2));

console.log("Updated sidebar.home translations");
