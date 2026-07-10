const fs = require('fs');
let modal = fs.readFileSync('src/components/AuthModal.tsx', 'utf8');

const regex = /return \(\s*<div className="fixed inset-0[^>]*>.*?<\/div>\s*\);\s*\}/s;

const newModal = `return (
    <div className="fixed inset-0 z-50 bg-[#fffbff]/60 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto" id="auth-modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-teal-700/5 flex flex-col p-8 text-center border border-[#ebe9cf] overflow-hidden"
        id="auth-modal-container"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9af4d6] via-[#01725a] to-[#9af4d6] opacity-30"></div>
        
        <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
          {mode === 'login' ? (
            <Lock className="h-10 w-10 text-teal-700" strokeWidth={1.5} />
          ) : (
            <User className="h-10 w-10 text-teal-700" strokeWidth={1.5} />
          )}
        </div>
        
        <h2 className="font-semibold text-[24px] text-gray-900 mb-3 tracking-tight">
          {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
        </h2>
        
        <p className="text-[14px] text-gray-600 mb-6 px-2">
          {mode === 'login' 
            ? 'Sign in to FindTrack to manage your lost & found items and stay connected with the community.'
            : 'Join FindTrack to securely report, track, and recover your lost belongings.'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm py-2 px-3 rounded-lg mb-6 flex items-start text-left gap-2">
            <span className="font-bold shrink-0 mt-0.5">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label className="font-dmsans text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Carl Jaya"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 pr-11 pl-4 py-3 font-dmsans text-[13px] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"
                  id="signup-input-name"
                />
                <User className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-dmsans text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pr-11 pl-4 py-3 font-dmsans text-[13px] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"
                id="auth-input-email"
              />
              <Mail className="absolute right-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5 mb-2">
            <div className="flex items-center justify-between">
              <label className="font-dmsans text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Password</label>
              {mode === 'login' && (
                <a className="font-dmsans text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-not-allowed">
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-4 pr-20 py-3 font-dmsans text-[13px] text-slate-800 transition focus:border-indigo-500 focus:bg-white focus:outline-none"
                id="auth-input-password"
              />
              <Lock className="absolute right-12 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 p-1 text-slate-400 hover:text-indigo-600 rounded transition-all duration-200 ease-out hover:scale-115 active:scale-90 active:rotate-3 cursor-pointer"
                style={{ transition: 'all 0.2s ease' }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <div className="transition-all duration-200" style={{ transition: 'all 0.2s ease' }}>
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-indigo-600" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </div>
              </button>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3 mt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#01725a] text-white font-medium text-[14px] py-3 px-6 rounded-lg shadow-md hover:bg-[#00654f] transition-all duration-200 flex items-center justify-center gap-2"
              id="auth-submit-btn"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
            <button 
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError(null);
              }}
              className="w-full bg-transparent text-[#01725a] border border-[#01725a] font-medium text-[14px] py-3 px-6 rounded-lg hover:bg-teal-50 transition-all duration-200 flex items-center justify-center gap-2"
              id="auth-toggle-mode-btn"
            >
              {mode === 'login' ? 'Create a free account' : 'Sign In instead'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <button 
            onClick={onClose}
            className="font-medium text-[14px] text-gray-500 hover:text-[#01725a] underline decoration-gray-400/30 underline-offset-4 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </motion.div>
    </div>
  );
}`;

if (regex.test(modal)) {
  modal = modal.replace(regex, newModal);
  fs.writeFileSync('src/components/AuthModal.tsx', modal);
  console.log('AuthModal replaced!');
} else {
  console.log('Regex did not match AuthModal!');
}
