const fs = require('fs');
const path = require('path');

const pixelReplacements = {
  'w-\\[18px\\]': 'w-4.5',
  'h-\\[18px\\]': 'h-4.5',
  'w-\\[14px\\]': 'w-3.5',
  'h-\\[14px\\]': 'h-3.5',
  'mt-\\[20px\\]': 'mt-5',
  'w-\\[400px\\]': 'w-96',
  'h-\\[400px\\]': 'h-96',
  'w-\\[150px\\]': 'w-36',
  'h-\\[150px\\]': 'h-36',
  'top-\\[2px\\]': 'top-0.5',
  'left-\\[2px\\]': 'left-0.5',
  'h-\\[48px\\]': 'h-12',
  'h-\\[600px\\]': 'h-[600px]', // this is okay since it's a huge block
  'h-\\[160px\\]': 'h-40',
  'w-\\[140px\\]': 'w-36',
  'w-\\[300px\\]': 'w-72',
  'w-\\[280px\\]': 'w-72',
  'w-\\[16px\\]': 'w-4',
  'h-\\[16px\\]': 'h-4',
  'w-\\[120px\\]': 'w-32',
  'h-\\[120px\\]': 'h-32',
  'h-\\[500px\\]': 'h-auto',
  'h-\\[300px\\]': 'h-72',
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
    for (const [key, value] of Object.entries(pixelReplacements)) {
      const regex = new RegExp(key, 'g');
      content = content.replace(regex, value);
    }
    
    // Also fix standard button patterns to match what user wants.
    // "primary buttons (solid teal) vs secondary/outlined buttons"
    // "page headlines and primary action buttons are the most visually dominant"
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});
