const fs = require('fs');
const { translate } = require('@vitalets/google-translate-api');

async function run() {
  const words = JSON.parse(fs.readFileSync('words.json'));
  const langs = ['fr', 'zh-CN', 'tl', 'es'];
  const localeCodes = { 'fr': 'fr', 'zh-CN': 'zh', 'tl': 'fil', 'es': 'es' };
  
  const translations = {
    en: {}, fr: {}, zh: {}, fil: {}, es: {}
  };

  const BATCH_SIZE = 50; // process in batches
  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);
    
    // Assign english keys
    batch.forEach((w, idx) => {
      const key = `string_${i + idx}`;
      translations.en[key] = w;
    });

    console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(words.length/BATCH_SIZE)}...`);
    
    // text to translate
    const textToTranslate = batch.join('\n|||\n');
    
    for (const lang of langs) {
      try {
        const res = await translate(textToTranslate, { to: lang });
        const translatedBatch = res.text.split('\n|||\n').map(s => s.trim());
        
        batch.forEach((w, idx) => {
          const key = `string_${i + idx}`;
          let tw = translatedBatch[idx] || w; // fallback to original if split failed
          // fix google translate artifacts
          tw = tw.replace(/^\|\|\| | \|\|\|$/g, '').trim();
          translations[localeCodes[lang]][key] = tw;
        });
      } catch (err) {
        console.error(`Failed translation to ${lang}:`, err.message);
        // Fallback to english
        batch.forEach((w, idx) => {
          const key = `string_${i + idx}`;
          translations[localeCodes[lang]][key] = w;
        });
      }
    }
  }

  // merge into existing locales
  const i18nDir = 'src/i18n/locales';
  const codes = ['en', 'fr', 'zh', 'fil', 'es'];
  
  codes.forEach(c => {
    const file = `${i18nDir}/${c}.json`;
    let data = {};
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file));
    }
    data.generated = translations[c];
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  });
  
  fs.writeFileSync('translations_map.json', JSON.stringify(translations.en, null, 2));
  console.log("Translations completed.");
}

run();
