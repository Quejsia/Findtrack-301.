const fs = require('fs');
const path = require('path');

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
    
    // Fix the bad regex replacement: className= shadow-sm"w-full -> className="shadow-sm w-full
    content = content.replace(/className= shadow-sm"w-full/g, 'className="shadow-sm w-full');
    content = content.replace(/className= shadow-sm"(.*?)"/g, 'className="shadow-sm $1"');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});
