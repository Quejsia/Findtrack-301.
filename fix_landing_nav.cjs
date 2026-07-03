const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const desktopNav = `<nav className="hidden md:flex items-center gap-6">
                <button onClick={() => setCurrentView("landing")} className="text-[#01725a] border-b-2 border-[#01725a] pb-1 font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Home</button>
                <button className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">How it Works</button>
                <button className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Community</button>
                <button className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Safety</button>
              </nav>`;

const newDesktopNav = `<nav className="hidden md:flex items-center gap-6">
                <button onClick={() => setCurrentView("landing")} className="text-[#01725a] border-b-2 border-[#01725a] pb-1 font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Home</button>
                <button onClick={() => setCurrentView("help")} className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">How it Works</button>
                <button onClick={() => setCurrentView("about")} className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Community</button>
                <button onClick={() => setCurrentView("safety")} className="text-[#666551] font-medium text-sm hover:text-[#01725a] transition-colors duration-200">Safety</button>
              </nav>`;

const mobileNav = `<div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-xl z-50 p-6 flex flex-col gap-4 border-b border-slate-100">
              <button className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Home</button>
              <button className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">How it Works</button>
              <button className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Community</button>
              <button className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Safety</button>
              <hr className="border-slate-100 my-2" />`;

const newMobileNav = `<div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-xl z-50 p-6 flex flex-col gap-4 border-b border-slate-100">
              <button onClick={() => { setCurrentView("landing"); setLandingMenuOpen(false); }} className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Home</button>
              <button onClick={() => { setCurrentView("help"); setLandingMenuOpen(false); }} className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">How it Works</button>
              <button onClick={() => { setCurrentView("about"); setLandingMenuOpen(false); }} className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Community</button>
              <button onClick={() => { setCurrentView("safety"); setLandingMenuOpen(false); }} className="text-left font-medium text-slate-700 hover:text-[#01725a] py-2">Safety</button>
              <hr className="border-slate-100 my-2" />`;

code = code.replace(desktopNav, newDesktopNav);
code = code.replace(mobileNav, newMobileNav);

fs.writeFileSync('src/App.tsx', code);
