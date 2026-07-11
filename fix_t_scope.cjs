const fs = require('fs');

function insertT(file) {
  let content = fs.readFileSync(file, 'utf8');
  // Find where the function body starts
  // Look for the first '{' after 'export default function '
  const funcStartIdx = content.indexOf('export default function');
  if (funcStartIdx === -1) return;
  
  const bracketIdx = content.indexOf('{', funcStartIdx + 'export default function'.length);
  // Find the closing bracket of the parameters
  const paramEndIdx = content.indexOf(')', bracketIdx);
  const bodyStartIdx = content.indexOf('{', paramEndIdx);
  
  if (bodyStartIdx !== -1) {
    const before = content.slice(0, bodyStartIdx + 1);
    const after = content.slice(bodyStartIdx + 1);
    
    // Check if it already has const { t }
    if (!after.trim().startsWith('const { t } = useTranslation()')) {
      content = before + '\n  const { t } = useTranslation();' + after;
      fs.writeFileSync(file, content);
      console.log('Fixed', file);
    }
  }
}

insertT('src/components/ItemDetail.tsx');
insertT('src/components/SubmissionForm.tsx');
