const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<div className="bg-surface-container rounded-lg p-4 text-center col-span-2 flex items-center justify-center gap-3">
                          <div>
                            <span className="block font-headline-lg text-tertiary text-2xl mb-1">Top {Math.max(1, 100 - items.filter(i => i.userId === auth.currentUser?.uid).length * 5)}%</span>
                            <span className="font-label-md text-on-surface-variant uppercase tracking-wide text-[10px]">Local Finders</span>
                          </div>
                          <TrendingUp className="h-8 w-8 text-tertiary opacity-50" />
                        </div>`;

code = code.replace(targetStr, '');
fs.writeFileSync('src/App.tsx', code);
