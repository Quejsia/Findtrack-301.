const fs = require('fs');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Let's standardise the buttons. 
  // We'll replace primary buttons with a consistent class string.
  // Primary:
  content = content.replace(/className="[^"]*bg-primary text-white[^"]*"/g, 
    'className="w-full sm:w-auto bg-primary text-white px-6 py-3 rounded-lg font-bold shadow-md hover:bg-primary-dim transition-colors flex items-center justify-center gap-2"');
  
  // Also fix the padding/margins
  content = content.replace(/p-\[20px\]/g, 'p-5');
  content = content.replace(/p-\[24px\]/g, 'p-6');
  content = content.replace(/p-\[16px\]/g, 'p-4');
  content = content.replace(/px-\[20px\]/g, 'px-5');
  content = content.replace(/py-\[20px\]/g, 'py-5');
  content = content.replace(/gap-\[10px\]/g, 'gap-2.5');
  content = content.replace(/gap-\[12px\]/g, 'gap-3');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${filePath}`);
  }
}

['src/App.tsx'].forEach(processFile);
