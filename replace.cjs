const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");

const translationsMap = JSON.parse(fs.readFileSync('translations_map.json'));
// Create reverse map: text -> key
const textToKey = {};
for (const [key, text] of Object.entries(translationsMap)) {
  textToKey[text] = key;
}

for (const sourceFile of project.getSourceFiles()) {
  let modified = false;
  let componentNeedsT = false;

  // 1. Replace JSX Text
  const jsxTexts = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
  for (const t of jsxTexts) {
    const text = t.getText().trim();
    if (textToKey[text]) {
      const key = textToKey[text];
      const original = t.getText();
      const replacement = original.replace(text, `{t('generated.${key}')}`);
      t.replaceWithText(replacement);
      modified = true;
      componentNeedsT = true;
    }
  }

  // 2. Replace Attributes
  const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
  for (const attr of jsxAttributes) {
    const name = attr.getNameNode().getText();
    if (['placeholder', 'title', 'alt'].includes(name)) {
      const init = attr.getInitializer();
      if (init && init.getKind() === SyntaxKind.StringLiteral) {
        const text = init.getLiteralValue();
        if (textToKey[text]) {
          const key = textToKey[text];
          attr.setInitializer(`{t('generated.${key}')}`);
          modified = true;
          componentNeedsT = true;
        }
      }
    }
  }

  if (modified) {
    // Check if we need to add useTranslation
    const imports = sourceFile.getImportDeclarations();
    const hasI18nImport = imports.some(i => i.getModuleSpecifierValue() === 'react-i18next');
    if (!hasI18nImport) {
      sourceFile.addImportDeclaration({
        namedImports: ['useTranslation'],
        moduleSpecifier: 'react-i18next'
      });
    }

    // Find components and inject `const { t } = useTranslation();`
    const functions = [
      ...sourceFile.getFunctions(),
      ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
      ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression)
    ];

    for (const func of functions) {
      // Check if it returns JSX or contains JSX elements
      const hasJsx = func.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 || 
                     func.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0;
      
      if (hasJsx) {
        const body = func.getBody();
        if (body && body.getKind() === SyntaxKind.Block) {
          const bodyText = body.getText();
          if (!bodyText.includes('useTranslation()')) {
            body.insertStatements(0, 'const { t } = useTranslation();');
          }
        }
      }
    }

    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getBaseName()}`);
  }
}
