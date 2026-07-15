const fs = require('fs');
const path = require('path');

const replacements = {
  // Grays / Slates
  'text-gray-900': 'text-on-surface',
  'text-gray-800': 'text-on-surface',
  'text-gray-700': 'text-on-surface-variant',
  'text-gray-600': 'text-on-surface-variant',
  'text-gray-500': 'text-on-surface-variant',
  'text-gray-400': 'text-on-surface-variant',
  'text-gray-300': 'text-outline-variant',
  'text-slate-900': 'text-on-surface',
  'text-slate-800': 'text-on-surface',
  'text-slate-700': 'text-on-surface-variant',
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
  'border-slate-250': 'border-outline-variant',
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
  'text-indigo-600': 'text-primary',
  'text-indigo-500': 'text-primary-dim',
  'text-blue-500': 'text-secondary',

  // Red/Rose to Error
  'text-red-500': 'text-error',
  'text-rose-700': 'text-error',
  'text-rose-500': 'text-error',
  'bg-rose-50': 'bg-error-container/20',
  'border-rose-100': 'border-error/30',

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
  
  // Specific Indigo fixes
  'focus:border-indigo-500': 'focus:border-primary',
  'focus:ring-indigo-500': 'focus:ring-primary',
  'border-indigo-200': 'border-primary/30',
  'bg-indigo-50/20': 'bg-primary-container/10',
  'hover:bg-indigo-50/50': 'hover:bg-primary-container/20',
  'text-indigo-600': 'text-primary',

  // Buttons standardization
  'w-full sm:w-auto bg-tertiary-container text-on-tertiary-container px-6 py-3 rounded-lg font-semibold text-sm shadow-md hover:bg-[#ebaa32] transition-colors flex items-center justify-center gap-2': 
  'w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary-dim transition-colors flex items-center justify-center gap-2',
  'w-full sm:w-auto border-2 border-primary text-primary px-6 py-3 rounded-lg font-semibold text-sm hover:bg-primary/5 transition-colors': 
  'w-full sm:w-auto border-2 border-primary text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2',

  // Spacing & input standardisation 
  'px-3.5 py-2': 'px-4 py-3',
  'rounded-lg': 'rounded-xl', // Upgrade everything from lg to xl for consistency
  'rounded-2xl': 'rounded-xl', // Or stick to 2xl for cards.
  
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
    
    // Manual complex regexes
    
    // Replace all bg-indigo-XXX
    content = content.replace(/bg-indigo-\d+(?:\/\d+)?/g, 'bg-primary-container/10');
    // Replace hover:bg-indigo-XXX
    content = content.replace(/hover:bg-indigo-\d+(?:\/\d+)?/g, 'hover:bg-primary-container/20');
    // Replace text-indigo-XXX
    content = content.replace(/text-indigo-\d+(?:\/\d+)?/g, 'text-primary');
    // Replace border-indigo-XXX
    content = content.replace(/border-indigo-\d+(?:\/\d+)?/g, 'border-primary/30');

    // Make inputs consistent
    content = content.replace(/className="[^"]*focus:border-primary[^"]*"/g, (match) => {
       if (match.includes('<button')) return match;
       // Clean up padding to px-4 py-3
       let m = match.replace(/px-\d\.?\d*/g, 'px-4').replace(/py-\d\.?\d*/g, 'py-3');
       // Clean up rounded
       m = m.replace(/rounded-(?:md|lg|2xl|3xl|sm)/g, 'rounded-xl');
       // Ensure shadow-sm
       if (!m.includes('shadow-')) m = m.replace('"', ' shadow-sm"');
       return m;
    });

    for (const [key, value] of Object.entries(replacements)) {
      // basic string replace for all
      content = content.split(key).join(value);
    }
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});
