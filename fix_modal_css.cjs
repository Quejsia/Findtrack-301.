const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(
    'padding: 40px 32px; max-width: 380px; width: calc(100% - 40px);',
    'padding: 40px 32px; max-width: 380px; width: calc(100% - 40px); max-height: 85dvh; overflow-y: auto;'
);

fs.writeFileSync('src/index.css', code);
