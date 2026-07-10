const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const settingsPanel = `
            {/* Settings */}
            <div className={\`\${activeTab === "settings" ? "block" : "hidden"} flex-1 flex flex-col min-w-0 h-full\`}>
              <SettingsPage />
            </div>
`;
const aboutPanelRegex = /(<section\s*id="about"\s*className=\{`\$\{activeTab === "about" \? "block" : "hidden"\}`\}\s*>)/;

if (aboutPanelRegex.test(app)) {
  app = app.replace(aboutPanelRegex, settingsPanel + "\n            $1");
  fs.writeFileSync('src/App.tsx', app);
  console.log('App updated with Settings Panel!');
} else {
  console.log('Regex did not match!');
}
