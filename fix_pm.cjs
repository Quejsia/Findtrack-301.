const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = code.substring(
  code.indexOf('{/* Private Messages */}'),
  code.indexOf('{/* Footer Banner */}')
);

const replacement = `{/* Private Messages */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Private Messages</h2>
                    <div className="space-y-4 overflow-y-auto flex-1 pr-2 flex items-center justify-center flex-col text-slate-500">
                      <MessageSquare className="h-12 w-12 mb-3 text-slate-300" />
                      <p className="text-sm font-medium">No messages yet</p>
                      <p className="text-xs text-center mt-1">When someone contacts you about your reported item, it will appear here.</p>
                    </div>
                  </div>
              </div>

              `;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
