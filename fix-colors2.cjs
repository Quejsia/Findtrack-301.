const fs = require('fs');
const path = require('path');

const replacements = {
  // Grays/Slates
  'text-gray-900': 'text-on-surface',
  'text-gray-800': 'text-on-surface',
  'text-gray-700': 'text-on-surface',
  'text-gray-600': 'text-on-surface-variant',
  'text-gray-500': 'text-on-surface-variant',
  'text-gray-400': 'text-on-surface-variant',
  'text-gray-300': 'text-outline-variant',
  'text-slate-900': 'text-on-surface',
  'text-slate-800': 'text-on-surface',
  'text-slate-700': 'text-on-surface',
  'text-slate-600': 'text-on-surface-variant',
  'text-slate-500': 'text-on-surface-variant',
  'text-slate-400': 'text-on-surface-variant',
  
  'bg-gray-900': 'bg-on-surface',
  'bg-gray-800': 'bg-on-surface',
  'bg-gray-100': 'bg-surface-variant',
  'bg-gray-50': 'bg-surface-container',
  'bg-slate-100': 'bg-surface-variant',
  'bg-slate-50': 'bg-surface-container',
  
  'border-gray-200': 'border-outline-variant',
  'border-gray-100': 'border-outline-variant/50',
  'border-gray-50': 'border-surface-variant',
  'border-slate-200': 'border-outline-variant',
  'border-slate-100': 'border-outline-variant/50',

  'bg-white': 'bg-surface-container-lowest',
  
  // Teal/Sky/Indigo to Primary/Secondary
  'text-teal-900': 'text-on-primary-container',
  'text-teal-800': 'text-on-primary-container',
  'text-teal-700': 'text-primary-dim',
  'text-teal-600': 'text-primary',
  'text-teal-500': 'text-primary',
  
  'bg-teal-50': 'bg-primary-container/20',
  'border-teal-100': 'border-primary-container',
  'shadow-teal-700': 'shadow-primary-dim',

  'text-sky-500': 'text-primary',
  'text-indigo-500': 'text-primary-dim',
  'text-blue-500': 'text-secondary',

  // Red/Rose to Error
  'text-red-500': 'text-error',
  'text-rose-500': 'text-error',

  // Green/Emerald to Primary (or keep green if success, but we should stick to theme)
  'text-green-500': 'text-primary',
  'text-emerald-500': 'text-primary',

  // Amber/Yellow to Tertiary
  'text-amber-500': 'text-tertiary-container',
  'text-amber-900': 'text-on-tertiary-container',
  'text-amber-950': 'text-on-tertiary-container',
  'text-amber-800': 'text-tertiary',
  'bg-amber-50': 'bg-tertiary-container/10',
  'bg-amber-100': 'bg-tertiary-container/20',
  'border-amber-100': 'border-tertiary-container/30',
  'border-amber-200': 'border-tertiary-container/50',
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
