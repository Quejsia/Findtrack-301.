const fs = require('fs');
const path = require('path');

const replacements = {
  'text-\\[#01725a\\]': 'text-primary',
  'bg-\\[#01725a\\]': 'bg-primary',
  'border-\\[#01725a\\]': 'border-primary',
  'fill-\\[#01725a\\]': 'fill-primary',
  'stroke-\\[#01725a\\]': 'stroke-primary',

  'text-\\[#00654f\\]': 'text-primary-dim',
  'bg-\\[#00654f\\]': 'bg-primary-dim',
  'border-\\[#00654f\\]': 'border-primary-dim',

  'text-\\[#393927\\]': 'text-on-surface',
  'bg-\\[#393927\\]': 'bg-on-surface',
  
  'text-\\[#666551\\]': 'text-on-surface-variant',
  'bg-\\[#666551\\]': 'bg-on-surface-variant',

  'text-\\[#82826c\\]': 'text-outline',
  'border-\\[#82826c\\]': 'border-outline',

  'bg-\\[#fffbff\\]': 'bg-surface',
  'text-\\[#fffbff\\]': 'text-surface',

  'bg-\\[#fdfae7\\]': 'bg-surface-container-low',
  
  'bg-\\[#f7f4df\\]': 'bg-surface-container',
  'border-\\[#f7f4df\\]': 'border-surface-container',

  'bg-\\[#f1efd8\\]': 'bg-surface-container-high',
  'border-\\[#f1efd8\\]': 'border-surface-container-high',

  'bg-\\[#ebe9cf\\]': 'bg-surface-variant',
  'border-\\[#ebe9cf\\]': 'border-surface-variant',

  'bg-\\[#fab83f\\]': 'bg-tertiary-container',
  'text-\\[#fab83f\\]': 'text-tertiary-container',
  
  'bg-\\[#865c00\\]': 'bg-tertiary',
  'text-\\[#865c00\\]': 'text-tertiary',

  'text-\\[#553900\\]': 'text-on-tertiary-container',
  'bg-\\[#553900\\]': 'bg-on-tertiary-container',

  'bg-\\[#af3d3b\\]': 'bg-error',
  'text-\\[#af3d3b\\]': 'text-error',
  'border-\\[#af3d3b\\]': 'border-error',

  'bg-\\[#f0f4f8\\]': 'bg-surface-container',
  'bg-\\[#f8fafc\\]': 'bg-surface-container-lowest',
  'text-\\[#1e293b\\]': 'text-on-surface',
  'text-\\[#475569\\]': 'text-on-surface-variant',
  'text-\\[#64748b\\]': 'text-on-surface-variant',
  'border-\\[#e2e8f0\\]': 'border-surface-variant',
  'border-\\[#cbd5e1\\]': 'border-outline-variant',
  'text-\\[#f59e0b\\]': 'text-tertiary-container',
  'bg-\\[#fef3c7\\]': 'bg-surface-container-high',
  'border-\\[#fbbf24\\]': 'border-tertiary-container',
  
  'p-\\[20px\\]': 'p-5',
  'p-\\[24px\\]': 'p-6',
  'p-\\[16px\\]': 'p-4',
  'px-\\[20px\\]': 'px-5',
  'py-\\[20px\\]': 'py-5',
  'px-\\[16px\\]': 'px-4',
  'py-\\[16px\\]': 'py-4',
  
  'gap-\\[10px\\]': 'gap-2.5',
  'gap-\\[12px\\]': 'gap-3',
  'gap-\\[16px\\]': 'gap-4',
  'gap-\\[20px\\]': 'gap-5',
  'gap-\\[24px\\]': 'gap-6',
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
