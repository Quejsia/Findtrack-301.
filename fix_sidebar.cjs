const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\s*id:\s*"home",\s*label:\s*"Dashboard",\s*icon:\s*Home\s*\},[\s\S]*?\]/m;

const newArray = `{ id: "home", label: "Dashboard", icon: Home },
                { id: "search", label: "Item Listings", icon: FileSearch },
                { id: "report", label: "Report Item", icon: PlusCircle },
                { id: "search", label: "Search", icon: Search },
                { id: "notifications", label: "Alerts", icon: Bell },
                { id: "profile", label: "Profile", icon: UserIcon },
                { id: "myitems", label: "My Items", icon: Package },
                { id: "pinned", label: "Pinned Items", icon: Tag },
                { id: "categories", label: "Categories", icon: Grid },
                { id: "analytics", label: "Analytics", icon: TrendingUp },
                { id: "tips", label: "Recovery Tips", icon: Lightbulb },
                { id: "packaging", label: "Packaging Tips", icon: PackageCheck },
                { id: "about", label: "About/Help", icon: Info }
              ]`;

if (regex.test(code)) {
    code = code.replace(regex, newArray);
    fs.writeFileSync('src/App.tsx', code);
    console.log('Replaced successfully.');
} else {
    console.log('Not found.');
}
