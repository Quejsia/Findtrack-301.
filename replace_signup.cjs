const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = '{/* ── VIEW 3: SIGNUP PAGE ── */}';
const endTag = '{/* ── VIEW 5: VERIFY EMAIL SCREEN ── */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `{/* ── VIEW 3: SIGNUP PAGE ── */}
      {currentView === "signup" && (
        <div className="bg-surface text-on-surface min-h-screen flex">
          <div className="flex flex-1 flex-col lg:flex-row w-full">
            {/* Left Side: Brand/Image */}
            <div className="relative hidden w-full flex-1 lg:flex flex-col bg-primary justify-center items-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <img 
                  className="w-full h-full object-cover opacity-40 mix-blend-overlay" 
                  alt="Community gathering" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvRFZSJBgEE2S4kkhaO3FQG94HOqflWeXoL7sWVnj0cOhd4whz01siH4EXJov53DfuShTq2v0BMqFvJoJkj_0tkmbaPPG8jWsm6SnnwXQ5o_2JqORb_gsB2IzZs3U31vlcGuPJ2_kSrom8AQj1y9o2Wn7pTAxfxxqxBatxF_0Qpck-1QipkaPBlFHQoBbWRXVj5iegysuvvce_AMs_OV4xTQfQbuZfw6pSuCirbU4wFv5VodyyiV-dwn93gHRSx1XEY15EVt6l3A"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/20 z-10"></div>
              <div className="relative z-20 flex flex-col items-center text-center px-12 max-w-2xl">
                <div className="mb-8 p-4 bg-surface/10 rounded-2xl backdrop-blur-sm border border-surface/20">
                  <span className="material-symbols-outlined text-on-primary text-6xl" style={{fontVariationSettings: "'FILL' 1"}}>volunteer_activism</span>
                </div>
                <h1 className="font-headline-lg text-4xl text-on-primary mb-6">Join the Community</h1>
                <p className="font-body-lg text-lg text-primary-fixed-dim">
                  FindTrack brings people together to recover lost items and build trust. Start your journey with our supportive network today.
                </p>
              </div>
            </div>

            {/* Right Side: Sign Up Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-surface">
              <div className="mx-auto w-full max-w-sm lg:w-96">
                <div>
                  <h2 className="mt-8 font-headline-lg text-4xl text-on-surface">Create an account</h2>
                  <p className="mt-2 font-body-md text-on-surface-variant">
                    Already a member?{" "}
                    <button 
                      onClick={() => setCurrentView("login")}
                      className="font-label-md text-sm font-semibold text-primary hover:text-primary-dim transition-colors"
                    >
                      Login here
                    </button>
                  </p>
                </div>

                <div className="mt-10">
                  <div>
                    <form onSubmit={handleSignupSubmit} className="space-y-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full">
                          <label className="block font-label-md text-sm text-on-surface mb-2" htmlFor="firstName">First Name</label>
                          <input 
                            id="firstName" 
                            name="firstName" 
                            type="text" 
                            required 
                            value={signupFirst}
                            onChange={(e) => setSignupFirst(e.target.value)}
                            className="block w-full rounded-lg border-0 py-3 px-4 text-on-surface bg-surface-container-low shadow-sm ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-md transition-shadow"
                          />
                        </div>
                        <div className="w-full">
                          <label className="block font-label-md text-sm text-on-surface mb-2" htmlFor="lastName">Last Name</label>
                          <input 
                            id="lastName" 
                            name="lastName" 
                            type="text" 
                            required 
                            value={signupLast}
                            onChange={(e) => setSignupLast(e.target.value)}
                            className="block w-full rounded-lg border-0 py-3 px-4 text-on-surface bg-surface-container-low shadow-sm ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-md transition-shadow"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-label-md text-sm text-on-surface mb-2" htmlFor="email">Email address</label>
                        <input 
                          id="email" 
                          name="email" 
                          type="email" 
                          required 
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="block w-full rounded-lg border-0 py-3 px-4 text-on-surface bg-surface-container-low shadow-sm ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-md transition-shadow"
                        />
                      </div>

                      <div>
                        <label className="block font-label-md text-sm text-on-surface mb-2" htmlFor="phone">Phone Number (Optional)</label>
                        <input 
                          id="phone" 
                          name="phone" 
                          type="tel" 
                          value={signupContact}
                          onChange={(e) => setSignupContact(e.target.value)}
                          className="block w-full rounded-lg border-0 py-3 px-4 text-on-surface bg-surface-container-low shadow-sm ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-md transition-shadow"
                        />
                      </div>

                      <div>
                        <label className="block font-label-md text-sm text-on-surface mb-2" htmlFor="password">Password</label>
                        <div className="relative">
                          <input 
                            id="password" 
                            name="password" 
                            type={showPass ? "text" : "password"}
                            required 
                            value={authPassword}
                            onChange={(e) => setAuthPass(e.target.value)}
                            className="block w-full rounded-lg border-0 py-3 px-4 text-on-surface bg-surface-container-low shadow-sm ring-1 ring-inset ring-outline-variant placeholder:text-outline focus:ring-2 focus:ring-inset focus:ring-primary font-body-md transition-shadow"
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" 
                          >
                            {showPass ? (
                              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                            ) : (
                              <Eye className="h-5 w-5" strokeWidth={1.5} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input 
                          id="terms" 
                          name="terms" 
                          type="checkbox" 
                          required 
                          className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-container-low"
                        />
                        <label className="ml-3 block font-body-md text-sm text-on-surface-variant" htmlFor="terms">
                          I agree to the <button type="button" onClick={() => setCurrentView("terms")} className="text-primary hover:underline">Terms of Service</button> and <button type="button" onClick={() => setCurrentView("privacy")} className="text-primary hover:underline">Privacy Policy</button>.
                        </label>
                      </div>

                      <div>
                        <button 
                          type="submit" 
                          disabled={loadingAuth}
                          className="flex w-full justify-center rounded-lg bg-primary-container px-3 py-3 font-label-md text-sm font-semibold text-on-primary-container shadow-sm hover:bg-primary-fixed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70"
                        >
                          {loadingAuth ? "Creating Account..." : "Create Account"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      `;
code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced signup');
