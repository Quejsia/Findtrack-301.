const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* ── REFERER DOMAIN BLOCKED EXPLANATION MODAL ── \*\/\}.*?\{\/\* Footer \*\/\}\s*<div className="[^"]*">\s*<button\s*onClick=\{[^}]*\}\s*className="[^"]*"\s*>\s*Close & Got It\s*<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)}/s;

const newModal = `{/* ── REFERER DOMAIN BLOCKED EXPLANATION MODAL ── */}
      {showRefererModal && (
        <div className="fixed inset-0 z-[1001] bg-[#fffbff]/60 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative z-10 w-full max-w-lg bg-white rounded-[24px] shadow-xl shadow-teal-700/5 flex flex-col p-8 text-center border border-[#ebe9cf] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9af4d6] via-[#01725a] to-[#9af4d6] opacity-30"></div>
            
            <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <span className="text-[40px]">⚠️</span>
            </div>
            
            <h2 className="font-semibold text-[24px] text-gray-900 mb-3 tracking-tight">Domain Security Authorization Required</h2>
            
            <div className="flex-1 overflow-y-auto space-y-4 text-left text-sm text-gray-600 mb-6 max-h-[50vh] px-2">
              <p className="font-medium text-gray-900 text-center">
                You are visiting FindTrack from a custom domain: <code className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200/50 font-mono">{refererBlockedDomain || window.location.hostname}</code>
              </p>
              
              <div className="bg-teal-50 border border-teal-100 p-4 rounded-xl text-teal-900">
                <p className="font-medium mb-1 flex items-center gap-2">💡 Quick Fix for Users / Testers:</p>
                <p>If you are a user trying to test FindTrack, please use the official sandbox domain of the app which is pre-authorized and works perfectly:</p>
                <a 
                  href="https://ais-pre-ugza3g3lajlvapecr5xph7-125820164386.asia-east1.run.app" 
                  className="font-semibold underline block mt-2 hover:text-teal-700 font-mono break-all text-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://ais-pre-ugza3g3lajlvapecr5xph7-125820164386.asia-east1.run.app
                </a>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs">
                  <p className="font-bold text-sm mb-1.5 flex items-center gap-1.5 text-amber-950">
                    <span>📧</span> Fix "Link expired" email verification error:
                  </p>
                  <p className="mb-2 leading-relaxed">
                    This is caused by restricting your Google Cloud API Key to your custom domain without also authorizing Firebase's default handler domains!
                  </p>
                  <p className="mb-1 leading-relaxed">To resolve this:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-amber-950">Google Cloud Credentials Console</a>.</li>
                    <li>Click your <strong>Browser/Web API Key</strong> to edit its settings.</li>
                    <li>In the <strong>HTTP Referrers (Website restrictions)</strong> list, you must add these three entries:
                      <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-[11px] bg-amber-100/50 p-2 rounded">
                        <li><code>https://findtrack-17dee.firebaseapp.com/*</code></li>
                        <li><code>https://findtrack-17dee.web.app/*</code></li>
                        <li><code>https://{window.location.hostname}/*</code></li>
                      </ul>
                    </li>
                  </ol>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">🛠️ General Domain Setup (For Signup Block):</p>
                  <p className="text-xs text-gray-500 mb-2">If you cannot register or login because the domain is blocked:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-xs">
                    <li>Go to the <strong><a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-teal-600 font-semibold underline hover:text-teal-800">Firebase Console</a></strong> and select your project.</li>
                    <li>In the sidebar, go to <strong>Authentication</strong>, then click the <strong>Settings</strong> tab.</li>
                    <li>In the left settings list, click <strong>Authorized Domains</strong>.</li>
                    <li>Click <strong>Add domain</strong> and enter: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{refererBlockedDomain || window.location.hostname}</code></li>
                  </ol>
                </div>
              </div>
            </div> 

            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => setShowRefererModal(false)}
                className="w-full bg-[#01725a] text-white font-medium text-[14px] py-3 px-6 rounded-lg shadow-md hover:bg-[#00654f] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Close & Got It
              </button>
            </div>
          </div>
        </div>
      )}`;

const matches = app.match(regex);
if (matches) {
  app = app.replace(regex, newModal);
  fs.writeFileSync('src/App.tsx', app);
  console.log('App.tsx modal replaced!');
} else {
  console.log('Regex did not match App.tsx modal!');
}
