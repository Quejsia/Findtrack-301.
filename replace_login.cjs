const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = '{/* ── VIEW 2: LOGIN PAGE ── */}';
const endTag = '{/* ── VIEW 3: SIGNUP PAGE ── */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `{/* ── VIEW 2: LOGIN PAGE ── */}
      {currentView === "login" && (
        <div className="bg-surface-container min-h-screen flex items-center justify-center p-4 md:p-8 font-body-md text-on-surface">
          {/* Decorative Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary-container rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute -bottom-40 left-20 w-80 h-80 bg-tertiary-container rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>

          {/* Login Card */}
          <main className="bg-white/85 backdrop-blur-[12px] border border-white/50 shadow-[0_8px_32px_0_rgba(1,114,90,0.05)] w-full max-w-md rounded-xl p-8 relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-headline-lg text-4xl text-primary mb-3 cursor-pointer" onClick={() => setCurrentView("landing")}>FindTrack</h1>
              <p className="font-body-lg text-lg text-on-surface-variant">Welcome back to the community.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1" htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-5 w-5" strokeWidth={1.5} />
                  <input 
                    className="w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                    id="email" 
                    name="email" 
                    placeholder="you@example.com" 
                    required 
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block font-label-md text-sm text-on-surface mb-1" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-5 w-5" strokeWidth={1.5} />
                  <input 
                    className="w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPass ? "text" : "password"}
                    value={authPassword}
                    onChange={(e) => setAuthPass(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" 
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? (
                      <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    type="button"
                    onClick={() => setCurrentView("reset")}
                    className="font-label-md text-sm text-primary hover:text-primary-dim transition-colors" 
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full py-3 px-4 bg-primary text-on-primary rounded-lg font-body-lg text-lg font-medium hover:bg-primary-dim transition-colors shadow-sm flex items-center justify-center gap-3" 
                type="submit"
              >
                Login
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="font-body-md text-on-surface-variant">
                Don't have an account?{" "}
                <button 
                  onClick={() => setCurrentView("signup")}
                  className="text-primary font-semibold hover:underline transition-all"
                >
                  Sign up
                </button>
              </p>
            </div>
          </main>
        </div>
      )}

      `;
code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced login');
