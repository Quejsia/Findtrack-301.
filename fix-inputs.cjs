const fs = require('fs');
const path = require('path');

const replacements = {
  // Input fields
  'w-full px-4 py-2 border border-outline-variant/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary': 'w-full px-4 py-3 border border-outline-variant bg-surface-container-lowest rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-on-surface transition-shadow shadow-sm',
  'w-full border border-outline-variant/50 rounded-lg p-3': 'w-full px-4 py-3 border border-outline-variant bg-surface-container-lowest rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-on-surface transition-shadow shadow-sm',
  
  // Secondary buttons
  'border-2 border-primary text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-container/10 transition-colors': 'w-full sm:w-auto border-2 border-primary text-primary px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2',
  'bg-surface-container-high border border-outline-variant hover:bg-surface-variant text-on-surface py-2 px-4 rounded-lg font-semibold text-xs transition-colors': 'w-full border-2 border-primary text-primary px-6 py-3 rounded-lg font-bold text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2',
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(key, 'g');
      content = content.replace(regex, value);
    }
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});
