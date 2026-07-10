const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Search Bar
app = app.replace(
  /<Search className="absolute left-3 top-1\/2 -translate-y-1\/2 h-4 w-4 text-outline" \/>\s*<input\s*type="text"\s*placeholder="Search community\.\.\."\s*className="pl-10 pr-4 py-2 bg-surface-container rounded-full text-sm border-none focus:ring-2 focus:ring-primary outline-none w-64 pointer-events-none"\s*readOnly\s*\/>/g,
  `<input 
                    type="text" 
                    placeholder="Search community..."
                    className="pr-10 pl-4 py-2 bg-surface-container rounded-full text-sm border-none focus:ring-2 focus:ring-primary outline-none w-64 pointer-events-none"
                    readOnly
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />`
);

// 2. Login Email
app = app.replace(
  /<Mail className="absolute left-3 top-1\/2 -translate-y-1\/2 text-on-surface-variant h-5 w-5" strokeWidth=\{1\.5\} \/>\s*<input\s*className="w-full pl-10 pr-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"\s*id="email"\s*name="email"\s*placeholder="you@example\.com"\s*required\s*type="email"\s*autoComplete="email"\s*value=\{authEmail\}\s*onChange=\{\(e\) => setAuthEmail\(e\.target\.value\)\}\s*\/>/g,
  `<input 
                    className="w-full pr-10 pl-3 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                    id="email" 
                    name="email" 
                    placeholder="you@example.com" 
                    required 
                    type="email"
                    autoComplete="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant h-5 w-5" strokeWidth={1.5} />`
);

// 3. Login Password
app = app.replace(
  /<Lock className="absolute left-3 top-1\/2 -translate-y-1\/2 text-on-surface-variant h-5 w-5" strokeWidth=\{1\.5\} \/>\s*<input\s*className="w-full pl-10 pr-10 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"\s*id="password"\s*name="password"\s*placeholder="••••••••"\s*required\s*type=\{showPass \? "text" : "password"\}\s*autoComplete="current-password"\s*value=\{authPassword\}\s*onChange=\{\(e\) => setAuthPass\(e\.target\.value\)\}\s*\/>/g,
  `<input 
                    className="w-full pl-3 pr-16 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    value={authPassword}
                    onChange={(e) => setAuthPass(e.target.value)}
                  />
                  <Lock className="absolute right-10 top-1/2 -translate-y-1/2 text-on-surface-variant h-5 w-5 pointer-events-none" strokeWidth={1.5} />`
);

// 4. Report Location
app = app.replace(
  /<MapPin className="absolute left-4 top-1\/2 -translate-y-1\/2 h-5 w-5 text-outline" \/>\s*<input type="text" required value=\{reportLocation\} onChange=\{\(e\) => setReportLocation\(e\.target\.value\)\} placeholder="e\.g\. Library 2nd Floor" className="w-full bg-surface-variant border-none rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none" \/>/g,
  `<input type="text" required value={reportLocation} onChange={(e) => setReportLocation(e.target.value)} placeholder="e.g. Library 2nd Floor" className="w-full bg-surface-variant border-none rounded-xl pr-12 pl-4 py-3 focus:ring-2 focus:ring-primary outline-none" />
                          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline pointer-events-none" />`
);

// Profile Name
app = app.replace(
  /<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">\s*<UserIcon className="h-5 w-5 text-outline" \/>\s*<\/div>\s*<input\s*className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2\.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md"\s*id="profName"\s*type="text"\s*value=\{profileName\}\s*onChange=\{\(e\) => setProfileName\(e\.target\.value\)\}\s*\/>/g,
  `<input 
                              className="pr-10 pl-3 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profName" 
                              type="text" 
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <UserIcon className="h-5 w-5 text-outline" />
                            </div>`
);

// Profile Email
app = app.replace(
  /<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">\s*<Mail className="h-5 w-5 text-outline" \/>\s*<\/div>\s*<input\s*className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2\.5 text-on-surface opacity-70 cursor-not-allowed font-body-md"\s*id="profEmail"\s*type="email"\s*value=\{profileEmail \|\| "No email"\}\s*disabled\s*\/>/g,
  `<input 
                              className="pr-10 pl-3 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface opacity-70 cursor-not-allowed font-body-md" 
                              id="profEmail" 
                              type="email" 
                              value={profileEmail || "No email"}
                              disabled
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-outline" />
                            </div>`
);

// Profile Phone
app = app.replace(
  /<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">\s*<span className="text-outline font-body-md">\+<\/span>\s*<\/div>\s*<input\s*className="pl-8 w-full bg-surface-container-lowest border border-outline rounded-lg py-2\.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md"\s*id="profPhone"\s*type="tel"\s*value=\{profileContact\}\s*onChange=\{\(e\) => setProfileContact\(e\.target\.value\)\}\s*\/>/g,
  `<input 
                              className="pr-8 pl-3 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profPhone" 
                              type="tel" 
                              value={profileContact}
                              onChange={(e) => setProfileContact(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-outline font-body-md">+</span>
                            </div>`
);

// Profile Loc
app = app.replace(
  /<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">\s*<MapPin className="h-5 w-5 text-outline" \/>\s*<\/div>\s*<input\s*className="pl-10 w-full bg-surface-container-lowest border border-outline rounded-lg py-2\.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md"\s*id="profLoc"\s*type="text"\s*value=\{profileLocation\}\s*onChange=\{\(e\) => setProfileLocation\(e\.target\.value\)\}\s*\/>/g,
  `<input 
                              className="pr-10 pl-3 w-full bg-surface-container-lowest border border-outline rounded-lg py-2.5 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                              id="profLoc" 
                              type="text" 
                              value={profileLocation}
                              onChange={(e) => setProfileLocation(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <MapPin className="h-5 w-5 text-outline" />
                            </div>`
);

fs.writeFileSync('src/App.tsx', app);

let authModal = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

authModal = authModal.replace(
  /<User className="absolute left-3\.5 top-3 h-4 w-4 text-slate-400" \/>\s*<input\s*type="text"\s*required\s*value=\{fullName\}\s*onChange=\{\(e\) => setFullName\(e\.target\.value\)\}\s*placeholder="e\.g\. Carl Jaya"\s*className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 font-dmsans text-\[13px\] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"\s*id="signup-input-name"\s*\/>/g,
  `<input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Carl Jaya"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 py-3 font-dmsans text-[13px] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"
                      id="signup-input-name"
                    />
                    <User className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />`
);

authModal = authModal.replace(
  /<Mail className="absolute left-3\.5 top-3 h-4 w-4 text-slate-400" \/>\s*<input\s*type="email"\s*required\s*value=\{email\}\s*onChange=\{\(e\) => setEmail\(e\.target\.value\)\}\s*placeholder="you@example\.com"\s*className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 font-dmsans text-\[13px\] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"\s*id="auth-input-email"\s*\/>/g,
  `<input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 py-3 font-dmsans text-[13px] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"
                    id="auth-input-email"
                  />
                  <Mail className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />`
);

authModal = authModal.replace(
  /<Lock className="absolute left-3\.5 top-3 h-4 w-4 text-slate-400" \/>\s*<input\s*type=\{showPassword \? 'text' : 'password'\}\s*required\s*value=\{password\}\s*onChange=\{\(e\) => setPassword\(e\.target\.value\)\}\s*placeholder="••••••••"\s*className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 py-3 font-dmsans text-\[13px\] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"\s*id="auth-input-password"\s*\/>/g,
  `<input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-4 pr-20 py-3 font-dmsans text-[13px] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"
                    id="auth-input-password"
                  />
                  <Lock className="absolute right-12 top-3 h-4 w-4 text-slate-400 pointer-events-none" />`
);

authModal = authModal.replace(/cursor-pointer" cursor-pointer"/g, 'cursor-pointer"');

fs.writeFileSync('src/components/AuthModal.tsx', authModal);
