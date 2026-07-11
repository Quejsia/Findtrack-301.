const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const mapping = {
  "Home": "sidebar.home",
  "How it Works": "landing.howItWorks",
  "Community": "landing.community",
  "Safety": "landing.safety",
  "Login": "landing.login",
  "Get Started": "landing.getStarted",
  "About Us": "landing.aboutUs",
  "Privacy Policy": "landing.privacyPolicy",
  "Terms of Service": "landing.termsOfService",
  "Safety Guidelines": "landing.safetyGuidelines",
  "Help Center": "landing.helpCenter",
  "Contact Us": "landing.contactUs",
};

// Add to en.json
const enFile = 'src/i18n/locales/en.json';
const enData = JSON.parse(fs.readFileSync(enFile));
if (!enData.landing) enData.landing = {};

// Other languages
const frData = JSON.parse(fs.readFileSync('src/i18n/locales/fr.json'));
const zhData = JSON.parse(fs.readFileSync('src/i18n/locales/zh.json'));
const filData = JSON.parse(fs.readFileSync('src/i18n/locales/fil.json'));
const esData = JSON.parse(fs.readFileSync('src/i18n/locales/es.json'));

if (!frData.landing) frData.landing = {};
if (!zhData.landing) zhData.landing = {};
if (!filData.landing) filData.landing = {};
if (!esData.landing) esData.landing = {};

const translations = {
  "How it Works": { fr: "Comment ça marche", zh: "工作原理", fil: "Paano Ito Gumagana", es: "Cómo Funciona" },
  "Community": { fr: "Communauté", zh: "社区", fil: "Komunidad", es: "Comunidad" },
  "Safety": { fr: "Sécurité", zh: "安全", fil: "Kaligtasan", es: "Seguridad" },
  "Login": { fr: "Connexion", zh: "登录", fil: "Mag-login", es: "Iniciar sesión" },
  "Get Started": { fr: "Commencer", zh: "开始", fil: "Magsimula", es: "Empezar" },
  "About Us": { fr: "À Propos", zh: "关于我们", fil: "Tungkol sa Amin", es: "Acerca de Nosotros" },
  "Privacy Policy": { fr: "Politique de confidentialité", zh: "隐私政策", fil: "Patakaran sa Pagkapribado", es: "Política de Privacidad" },
  "Terms of Service": { fr: "Conditions d'utilisation", zh: "服务条款", fil: "Mga Tuntunin ng Serbisyo", es: "Términos de Servicio" },
  "Safety Guidelines": { fr: "Consignes de sécurité", zh: "安全指南", fil: "Mga Patnubay sa Kaligtasan", es: "Pautas de Seguridad" },
  "Help Center": { fr: "Centre d'aide", zh: "帮助中心", fil: "Help Center", es: "Centro de Ayuda" },
  "Contact Us": { fr: "Nous contacter", zh: "联系我们", fil: "Makipag-ugnayan sa Amin", es: "Contáctenos" }
};

for (const [eng, key] of Object.entries(mapping)) {
  if (key.startsWith('landing.')) {
    const k = key.split('.')[1];
    enData.landing[k] = eng;
    frData.landing[k] = translations[eng].fr;
    zhData.landing[k] = translations[eng].zh;
    filData.landing[k] = translations[eng].fil;
    esData.landing[k] = translations[eng].es;
  }
}

fs.writeFileSync(enFile, JSON.stringify(enData, null, 2));
fs.writeFileSync('src/i18n/locales/fr.json', JSON.stringify(frData, null, 2));
fs.writeFileSync('src/i18n/locales/zh.json', JSON.stringify(zhData, null, 2));
fs.writeFileSync('src/i18n/locales/fil.json', JSON.stringify(filData, null, 2));
fs.writeFileSync('src/i18n/locales/es.json', JSON.stringify(esData, null, 2));

// Replace in App.tsx
for (const [eng, key] of Object.entries(mapping)) {
  const regex = new RegExp(`>\\s*${eng}\\s*<`, 'g');
  app = app.replace(regex, `>{t('${key}')}<`);
}

fs.writeFileSync('src/App.tsx', app);
console.log('Replaced landing strings and updated locales.');
