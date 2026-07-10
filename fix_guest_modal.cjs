const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{\/\* ── GUEST ACCESS LOCK LOGIN REQUIRED MODAL ── \*\/\}.*?\{\/\* ── REFERER DOMAIN BLOCKED EXPLANATION MODAL ── \*\/\}/s;

const newModal = `{/* ── GUEST ACCESS LOCK LOGIN REQUIRED MODAL ── */}
      {showGuestModal && (
        <div 
          id="guestModalOverlay" 
          className="fixed inset-0 z-[1002] flex items-center justify-center p-4 bg-surface/60 backdrop-blur-md overflow-y-auto" 
          onClick={(e) => {
            if ((e.target as HTMLElement).id === "guestModalOverlay")
              setShowGuestModal(false);
          }}
        >
          <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-[24px] shadow-lg shadow-primary/5 flex flex-col items-center p-xl text-center border border-surface-variant overflow-hidden">
            {/* Decorative Top Gradient (Subtle) */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-container via-primary to-primary-container opacity-30"></div>
            
            {/* Icon Container */}
            <div className="w-20 h-20 rounded-full bg-tertiary-container flex items-center justify-center mb-lg shadow-sm">
              <span className="material-symbols-outlined text-[40px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            </div>
            
            {/* Headlines & Text */}
            <h2 className="font-headline-md text-headline-md text-on-surface mb-sm tracking-tight">Login Required</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl px-4 md:px-2 max-w-[280px] md:max-w-none">
              Please login or sign up to unlock the full features of FindTrack!
            </p>
            
            {/* Actions */}
            <div className="w-full flex flex-col gap-sm mb-lg">
              <button 
                onClick={() => {
                  setShowGuestModal(false);
                  setCurrentView("login");
                }}
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg shadow-md hover:bg-primary-dim transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>login</span>
                Login
              </button>
              <button 
                onClick={() => {
                  setShowGuestModal(false);
                  setCurrentView("signup");
                }}
                className="w-full bg-transparent text-secondary border border-secondary font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-surface-variant transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 0" }}>person_add</span>
                Sign Up
              </button>
            </div>
            
            {/* Subtle Link */}
            <button 
              onClick={() => setShowGuestModal(false)}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary underline decoration-on-surface-variant/30 underline-offset-4 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* ── REFERER DOMAIN BLOCKED EXPLANATION MODAL ── */}`;

if (regex.test(app)) {
  app = app.replace(regex, newModal);
  fs.writeFileSync('src/App.tsx', app);
  console.log('App.tsx modal replaced!');
} else {
  console.log('Regex did not match App.tsx modal!');
}
