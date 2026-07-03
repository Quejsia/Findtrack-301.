const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = '{/* PANEL: PROFILE */}';
const endTag = '{/* PANEL: MY ITEMS */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `{/* PANEL: PROFILE */}
            <section
              id="profile"
              className={\`\${activeTab === "profile" ? "block" : "hidden"} flex-1 flex flex-col min-w-0\`}
            >
              <div className="pt-8 px-4 md:px-8 pb-32 max-w-7xl mx-auto w-full space-y-8">
                {/* Mobile Menu Toggle header would be here, but we are inside the main canvas */}
                <h2 className="font-headline-sm text-3xl font-bold text-on-surface mb-8 hidden md:block">Profile Overview</h2>
                
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Profile Header Card (Hero) */}
                  <div className="col-span-1 lg:col-span-12 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent pointer-events-none"></div>
                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                      {/* Avatar Container with 'Level' Ring */}
                      <div className="relative group cursor-pointer shrink-0">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-tertiary-container shadow-md overflow-hidden relative bg-surface-variant flex items-center justify-center text-4xl font-bold text-on-surface-variant">
                          {profileName.charAt(0).toUpperCase()}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        {/* Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-tertiary text-on-tertiary px-3 py-1 rounded-full shadow-md flex items-center gap-1 border-2 border-surface-container-lowest">
                          <Star className="h-4 w-4" fill="currentColor" />
                          <span className="font-label-md text-[10px] uppercase font-bold tracking-wider">Level {Math.max(1, Math.floor(items.filter(i => i.userId === auth.currentUser?.uid).length / 5))}</span>
                        </div>
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1 text-center md:text-left mt-4 md:mt-0 w-full">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <h1 className="font-headline-lg text-4xl text-on-surface">{profileName}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                              <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-md text-sm font-semibold inline-flex items-center gap-1">
                                <Heart className="h-4 w-4" fill="currentColor" />
                                Community Member
                              </span>
                              <span className="text-on-surface-variant font-body-md flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {profileLocation || "Location not set"}
                              </span>
                            </div>
                            <p className="mt-4 font-body-md text-on-surface-variant max-w-2xl">
                              "Dedicated to keeping our community connected."
                            </p>
                          </div>
                          <button className="bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-variant px-4 py-2 rounded-lg font-label-md text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0 w-full md:w-auto">
                            <Settings className="h-[18px] w-[18px]" />
                            Edit Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6 flex-1 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-4 text-primary">
                        <div className="bg-primary-container p-2 rounded-lg">
                          <Package className="h-5 w-5 text-on-primary-container" />
                        </div>
                        <h3 className="font-headline-md text-lg font-semibold">Impact Stats</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-surface-container rounded-lg p-4 text-center">
                          <span className="block font-headline-lg text-primary text-3xl mb-1">{items.filter(i => i.userId === auth.currentUser?.uid).length}</span>
                          <span className="font-label-md text-on-surface-variant uppercase tracking-wide text-[10px]">Items Reported</span>
                        </div>
                        <div className="bg-surface-container rounded-lg p-4 text-center">
                          <span className="block font-headline-lg text-secondary text-3xl mb-1">{items.filter(i => i.userId === auth.currentUser?.uid && i.claimed).length}</span>
                          <span className="font-label-md text-on-surface-variant uppercase tracking-wide text-[10px]">Reunited</span>
                        </div>
                        <div className="bg-surface-container rounded-lg p-4 text-center col-span-2 flex items-center justify-center gap-3">
                          <div>
                            <span className="block font-headline-lg text-tertiary text-2xl mb-1">Top {Math.max(1, 100 - items.filter(i => i.userId === auth.currentUser?.uid).length * 5)}%</span>
                            <span className="font-label-md text-on-surface-variant uppercase tracking-wide text-[10px]">Local Finders</span>
                          </div>
                          <TrendingUp className="h-8 w-8 text-tertiary opacity-50" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Form */}
                  <div className="col-span-1 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6 md:p-8">
                    <h3 className="font-headline-md text-xl text-on-surface mb-6 border-b border-surface-variant pb-4">Personal Information</h3>
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); triggerToast("Profile updated successfully", "success"); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Group */}
                        <div>
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profName">Display Name</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-outline" />
                            </div>
                            <input 
                              className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profName" 
                              type="text" 
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profEmail">Email Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-outline" />
                            </div>
                            <input 
                              className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface opacity-70 cursor-not-allowed font-body-md" 
                              id="profEmail" 
                              type="email" 
                              value={profileEmail || "No email"}
                              disabled
                            />
                          </div>
                          {auth.currentUser?.emailVerified && (
                            <p className="text-xs text-on-surface-variant mt-1 ml-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                              Email verified
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profPhone">Phone Number</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-outline font-body-md">+</span>
                            </div>
                            <input 
                              className="pl-8 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profPhone" 
                              type="tel" 
                              value={profileContact}
                              onChange={(e) => setProfileContact(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profLoc">Primary Location</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin className="h-5 w-5 text-outline" />
                            </div>
                            <input 
                              className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profLoc" 
                              type="text" 
                              value={profileLocation}
                              onChange={(e) => setProfileLocation(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button 
                          className="bg-primary hover:bg-primary-dim text-on-primary font-label-md text-sm py-2.5 px-6 rounded-lg shadow-sm transition-colors" 
                          type="submit"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Settings & Preferences */}
                  <div className="col-span-1 lg:col-span-12 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-surface-variant">
                      {/* Notifications */}
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 text-on-surface">
                          <div className="bg-secondary-container p-2 rounded-lg">
                            <Bell className="h-5 w-5 text-on-secondary-container" />
                          </div>
                          <h3 className="font-headline-md text-lg font-semibold">Notification Preferences</h3>
                        </div>
                        <div className="space-y-5">
                          <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                              <span className="font-body-md text-on-surface font-medium block">New matches for my items</span>
                              <span className="font-body-md text-xs text-on-surface-variant">Get notified when a found item matches your report.</span>
                            </div>
                            <div className="relative">
                              <input defaultChecked className="sr-only peer" type="checkbox" />
                              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                          </label>
                          <label className="flex items-center justify-between cursor-pointer group">
                            <div>
                              <span className="font-body-md text-on-surface font-medium block">Community Alerts</span>
                              <span className="font-body-md text-xs text-on-surface-variant">Important alerts in your primary location.</span>
                            </div>
                            <div className="relative">
                              <input defaultChecked className="sr-only peer" type="checkbox" />
                              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      {/* Security */}
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6 text-on-surface">
                          <div className="bg-surface-variant p-2 rounded-lg">
                            <Lock className="h-5 w-5 text-on-surface-variant" />
                          </div>
                          <h3 className="font-headline-md text-lg font-semibold">Security</h3>
                        </div>
                        <div className="space-y-4">
                          <button className="w-full flex items-center justify-between p-4 rounded-lg border border-outline-variant hover:bg-surface-variant transition-colors group">
                            <div className="flex items-center gap-3 text-left">
                              <Key className="h-5 w-5 text-on-surface-variant" />
                              <div>
                                <span className="block font-body-md font-medium text-on-surface">Change Password</span>
                                <span className="block text-xs text-on-surface-variant mt-0.5">Update your security credentials</span>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                          </button>
                          
                          <div className="pt-4 mt-4 border-t border-surface-variant">
                            <button 
                              onClick={logOut}
                              className="text-error hover:text-error-dim font-label-md text-sm flex items-center gap-2 transition-colors w-full p-2"
                            >
                              <LogOut className="h-5 w-5" />
                              Sign Out Everywhere
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced profile');
