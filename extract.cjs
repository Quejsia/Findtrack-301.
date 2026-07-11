const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");

let strings = [];
for (const sourceFile of project.getSourceFiles()) {
  const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const t of jsxTexts) {
    const text = t.getText().trim();
    if (text.length > 0 && /[a-zA-Z]/.test(text) && !text.includes('t(')) {
      strings.push({file: sourceFile.getBaseName(), text, type: 'JsxText', line: t.getStartLineNumber()});
    }
  }

  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  for (const attr of jsxAttributes) {
    const name = attr.getNameNode().getText();
    if (['placeholder', 'title', 'alt'].includes(name)) {
      const init = attr.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        strings.push({file: sourceFile.getBaseName(), text: init.getLiteralValue(), type: 'Attribute', line: attr.getStartLineNumber()});
      }
    }
  }
}

// deduplicate
const unique = {};
strings.forEach(s => {
  const key = s.text.replace(/\s+/g, ' ').trim();
  if (!unique[key]) unique[key] = { ...s, count: 0, text: key };
  unique[key].count++;
});

fs.writeFileSync('strings.json', JSON.stringify(Object.values(unique), null, 2));
console.log("Extracted " + Object.values(unique).length + " strings.");
