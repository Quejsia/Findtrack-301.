const fs = require('fs');
let itemDetail = fs.readFileSync('src/components/ItemDetail.tsx', 'utf8');

const regex = /<div className="fixed inset-0 z-\[60\] flex items-start justify-center bg-slate-950\/80 backdrop-blur-md p-4 overflow-y-auto pt-16 pb-16" id="claims-verification-modal">.*?<\/motion\.div>\s*<\/div>/s;

const newModal = `<div className="fixed inset-0 z-[60] bg-[#fffbff]/60 backdrop-blur-md flex flex-col items-center justify-center p-4 overflow-y-auto" id="claims-verification-modal">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-white rounded-[24px] shadow-xl shadow-teal-700/5 flex flex-col p-8 text-center border border-[#ebe9cf] overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9af4d6] via-[#01725a] to-[#9af4d6] opacity-30"></div>
              
              <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShieldCheck className="h-10 w-10 text-teal-700" strokeWidth={1.5} />
              </div>
              
              <h2 className="font-semibold text-[24px] text-gray-900 mb-3 tracking-tight">"Prove It" Verification</h2>
              
              <p className="text-[14px] text-gray-600 mb-6 px-2">
                Authenticate your claims ownership details below for <strong>{item.title}</strong> so the listing recorder can verify securely.
              </p>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
                <div className="space-y-2">
                  <label className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center">
                    VERIFICATION QUESTION
                  </label>
                  {hasSecurityQuestion ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-900 text-center">
                      <p className="font-bold text-xs mb-1"><Key className="h-3 w-3 inline" /> OWNER'S SECRET QUESTION</p>
                      <p className="font-sans text-xs italic leading-relaxed">"{item.securityQuestion}"</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-205/65 rounded-md p-4 text-center">
                      <p className="font-sans text-xs text-slate-800 leading-relaxed font-medium">
                        How can we verify that this is your item? Describe it in detail.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className={\`space-y-2 \${isShaking ? 'animate-shake border-red-500' : ''}\`}>
                  <label htmlFor="claimer-answer-modal" className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-2 text-center">
                    YOUR CONFIDENTIAL ANSWER
                  </label>
                  <textarea
                    id="claimer-answer-modal"
                    rows={4}
                    value={claimAnswer}
                    onChange={(e) => {
                      setClaimAnswer(e.target.value);
                      setIsShaking(false);
                    }}
                    placeholder={hasSecurityQuestion ? "Type your exact answer here..." : "Provide specific details only the owner would know (e.g. scratches, contents)..."}
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none resize-none transition"
                    required
                  />
                  {isShaking && (
                    <p className="text-red-500 text-xs font-medium text-center">Please provide a valid answer to proceed.</p>
                  )}
                </div>

                <div className="w-full flex flex-col gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#01725a] text-white font-medium text-[14px] py-3 px-6 rounded-lg shadow-md hover:bg-[#00654f] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Encrypting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Submit Secure Claim
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenClaimModal(false)}
                    disabled={isSubmitting}
                    className="w-full bg-transparent text-[#01725a] border border-[#01725a] font-medium text-[14px] py-3 px-6 rounded-lg hover:bg-teal-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>`;

if (regex.test(itemDetail)) {
  itemDetail = itemDetail.replace(regex, newModal);
  fs.writeFileSync('src/components/ItemDetail.tsx', itemDetail);
  console.log('ItemDetail modal replaced!');
} else {
  console.log('Regex did not match ItemDetail modal!');
}
