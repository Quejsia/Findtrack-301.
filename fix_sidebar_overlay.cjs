const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = '{/* SIDEBAR (Desktop) */}';
const replacement = `{/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden" 
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {/* SIDEBAR (Desktop) */}`;

code = code.replace(targetStr, replacement);

fs.writeFileSync('src/App.tsx', code);
