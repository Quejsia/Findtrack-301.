const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// Import useTranslation and SettingsPage
if (!app.includes("import { useTranslation } from 'react-i18next';")) {
  app = app.replace(
    /import React, \{ useState, useEffect, useRef \} from 'react';/,
    "import React, { useState, useEffect, useRef } from 'react';\nimport { useTranslation } from 'react-i18next';\nimport { SettingsPage } from './pages/Settings';"
  );
}

// Add useTranslation to App component
if (!app.includes("const { t } = useTranslation();")) {
  app = app.replace(
    /export default function App\(\) \{/,
    "export default function App() {\n  const { t } = useTranslation();"
  );
}

// Update the sidebar items
const navItemsRegex = /\[\s*\{ id: "home", label: "Home", icon: Home \},[\s\S]*?\{ id: "about", label: "About \/ Help", icon: HelpCircle \}\s*\]/;
const newNavItems = `[
                { id: "home", label: t('sidebar.home'), icon: Home },
                { id: "report", label: t('sidebar.reportItem'), icon: PlusCircle },
                { id: "search", label: t('sidebar.search'), icon: Search },
                { id: "notifications", label: t('sidebar.alerts'), icon: Bell },
                { id: "profile", label: t('sidebar.profile'), icon: UserIcon },
                { id: "myitems", label: t('sidebar.myItems'), icon: Archive },
                { id: "pinned", label: t('sidebar.pinnedItems'), icon: Pin },
                { id: "categories", label: t('sidebar.categories'), icon: Shapes },
                { id: "analytics", label: t('sidebar.analytics'), icon: BarChart2 },
                { id: "tips", label: t('sidebar.recoveryTips'), icon: HeartHandshake },
                { id: "packaging", label: t('sidebar.packagingTips'), icon: Package },
                { id: "settings", label: t('sidebar.settings'), icon: Settings },
                { id: "about", label: t('sidebar.aboutHelp'), icon: HelpCircle }
              ]`;
app = app.replace(navItemsRegex, newNavItems);

// Add the settings panel rendering
const analyticsPanelRegex = /(<div\s*className=\{`panel \$\{activeTab === "analytics" \? "active" : ""\}`\}\s*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)/;
const settingsPanel = `
            {/* Settings */}
            <div className={\`\${activeTab === "settings" ? "block" : "hidden"} flex-1 flex flex-col min-w-0 h-full\`}>
              <SettingsPage />
            </div>
`;
// Actually, let's insert it before the About panel.
const aboutPanelRegex = /(<div\s*className=\{`\$\{activeTab === "about" \? "block" : "hidden"\}`\}\s*>)/;
app = app.replace(aboutPanelRegex, settingsPanel + "\n            $1");

fs.writeFileSync('src/App.tsx', app);
console.log('App updated.');
