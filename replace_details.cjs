const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = 'id="itemDetail"';
const endTag = '{/* PANEL: NOTIFICATIONS & ALERTS */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `id="itemDetail"
              className={\`\${activeTab === "itemDetail" ? "block" : "hidden"} bg-background h-full w-full overflow-y-auto\`}
            >
              {(() => {
                const r = items.find((x) => x.id === selectedItemId);
                if (!r)
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                      <Package className="h-12 w-12 mb-4 opacity-50" />
                      <p>Please choose an item from search.</p>
                    </div>
                  );

                return (
                  <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-variant pb-6">
                      <div>
                        <button
                          onClick={() => setActiveTab("search")}
                          className="inline-flex items-center gap-2 text-primary hover:text-primary-dim text-[12px] font-label-md mb-2 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Results
                        </button>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={\`px-3 py-1 text-[10px] font-bold tracking-wider rounded-full uppercase \${r.type === "lost" ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container"}\`}>
                            {r.type === "lost" ? "LOST" : "FOUND"}
                          </span>
                          <span className="text-on-surface-variant text-[12px] font-label-md border-l border-outline-variant pl-3">
                            Ref #{r.id.substring(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-[32px] sm:leading-[40px] font-headline-lg font-bold text-on-surface mt-3">
                          {r.title}
                        </h2>
                      </div>
                      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors text-primary shadow-sm border border-outline-variant">
                        <Share className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Left Column (Image & AI) */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* Image Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-surface-container-highest overflow-hidden relative aspect-video sm:aspect-[4/3] group">
                          {r.image || r.imageUrl ? (
                            <img
                              src={r.image || r.imageUrl}
                              alt={r.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-surface-variant text-outline">
                              <Camera className="h-16 w-16 opacity-30" />
                            </div>
                          )}
                          {/* Carousel Dots Overlay */}
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer shadow-sm"></div>
                            <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white/80 cursor-pointer shadow-sm"></div>
                          </div>
                        </div>

                        {/* Gemini AI Matchmaker Card */}
                        <div className="bg-surface-container-low rounded-xl p-4 sm:p-6 border border-primary-container relative overflow-hidden shadow-sm">
                          <div className="absolute inset-0 opacity-20 pointer-events-none"></div>
                          <div className="relative z-10 flex gap-4 items-start">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shadow-inner">
                              <Bot className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[16px] font-headline-md font-semibold text-primary">
                                  Gemini AI Matchmaker
                                </h3>
                                <button className="text-on-surface-variant hover:text-primary transition-colors">
                                  <RefreshCw className="h-5 w-5" />
                                </button>
                              </div>
                              <p className="text-[14px] font-body-md text-on-surface-variant leading-relaxed mb-3">
                                Our AI is actively cross-referencing this report against recent {r.type === 'lost' ? 'Found' : 'Lost'} listings in the area.
                              </p>
                              <div className="flex items-center gap-2 text-primary text-[12px] font-bold animate-pulse">
                                <Search className="h-4 w-4" /> Scanning local databases...
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column (Details & Contact) */}
                      <div className="lg:col-span-5 space-y-6">
                        {/* Item Details Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-surface-container-highest p-4 sm:p-6 lg:p-6 space-y-6">
                          <h3 className="text-[24px] font-headline-md font-semibold text-on-surface border-b border-surface-variant pb-3">
                            Item Details
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <Tag className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-[12px] font-label-md text-on-surface-variant mb-0.5">
                                  Category
                                </p>
                                <p className="text-[14px] font-body-md text-on-surface font-medium capitalize">
                                  {(r as any).category || "General"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Clock className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-[12px] font-label-md text-on-surface-variant mb-0.5">
                                  Date Logged
                                </p>
                                <p className="text-[14px] font-body-md text-on-surface font-medium">
                                  {r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : 'Recent'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <MapPin className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <p className="text-[12px] font-label-md text-on-surface-variant mb-0.5">
                                  Location
                                </p>
                                <p className="text-[14px] font-body-md text-on-surface font-medium">
                                  {r.location}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-surface-variant">
                            <p className="text-[12px] font-label-md text-on-surface-variant mb-2">
                              Description
                            </p>
                            <p className="text-[14px] font-body-md text-on-surface bg-surface-container rounded-lg p-3 border border-outline-variant/30 leading-relaxed whitespace-pre-wrap">
                              {r.desc || r.description || "No description provided."}
                            </p>
                          </div>
                        </div>

                        {/* Contact Credentials Card */}
                        <div className="bg-surface rounded-xl shadow-sm border border-surface-container-highest p-4 sm:p-6 lg:p-6 space-y-6">
                          <h3 className="text-[24px] font-headline-md font-semibold text-on-surface border-b border-surface-variant pb-3">
                            Contact Credentials
                          </h3>
                          <div className="flex items-center gap-4 bg-surface-container p-3 rounded-lg border border-outline-variant/30">
                            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-[24px] font-bold">
                              {r.contactName ? r.contactName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[12px] font-label-md text-on-surface-variant">
                                Reporter
                              </p>
                              <div className="flex items-center gap-1.5">
                                <p className="text-[14px] font-headline-md font-semibold text-on-surface truncate">
                                  {r.contactName || "Verified Reporter"}
                                </p>
                                <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                              </div>
                              <p className="text-[14px] font-body-md text-on-surface-variant mt-0.5 select-none filter blur-[4px] opacity-70">
                                hidden.email@example.com
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-2">
                            <button 
                              onClick={() => {
                                if (profileName === 'Guest') {
                                  setShowGuestModal(true);
                                } else {
                                  handleStartChat(r.userId, r.id);
                                }
                              }}
                              className="w-full py-3 bg-primary text-on-primary text-[12px] font-label-md font-bold rounded-lg hover:bg-primary-dim transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                              <MessageSquare className="h-4 w-4" />
                              Contact Chat Room
                            </button>
                            <button 
                              onClick={() => {
                                if (profileName === 'Guest') {
                                  setShowGuestModal(true);
                                } else {
                                  setActiveTab("claimItem");
                                }
                              }}
                              className="w-full py-3 bg-transparent border-2 border-secondary text-secondary hover:bg-secondary-container hover:text-on-secondary-container text-[12px] font-label-md font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Gavel className="h-4 w-4" />
                              Log Ownership Claim
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* PANEL: CLAIM ITEM VIEW */}
            <section
              id="claimItem"
              className={\`\${activeTab === "claimItem" ? "block" : "hidden"} bg-surface h-full w-full overflow-y-auto relative\`}
            >
              {(() => {
                const r = items.find((x) => x.id === selectedItemId);
                if (!r)
                  return (
                    <div className="flex flex-col items-center justify-center h-full text-on-surface-variant relative z-10">
                      <Package className="h-12 w-12 mb-4 opacity-50" />
                      <p>Please choose an item from search to claim.</p>
                    </div>
                  );

                return (
                  <>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="max-w-6xl mx-auto relative z-10 space-y-6 sm:space-y-8 pb-12">
                      {/* Page Header */}
                      <header className="mb-6 sm:mb-8">
                        <h1 className="text-[32px] leading-[40px] font-headline-lg font-bold text-on-surface mb-2">Log Ownership Claim</h1>
                        <div className="flex items-center gap-2 text-primary">
                          <Shield className="h-5 w-5" fill="currentColor" />
                          <span className="text-[14px] font-body-md font-medium tracking-wide">Prove-It Verification Layer</span>
                        </div>
                      </header>

                      {/* Layout Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Main Form Area (Left Column) */}
                        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
                          {/* Status Chip */}
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-[12px] font-label-md shadow-sm border border-primary-fixed/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                              Current Claim Item
                            </span>
                          </div>

                          {/* Item Thumbnail Card */}
                          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 hover:shadow-md transition-shadow duration-300">
                            {r.image || r.imageUrl ? (
                              <img
                                src={r.image || r.imageUrl}
                                alt={r.title}
                                className="w-full sm:w-40 h-40 object-cover rounded-lg border border-outline-variant/20 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full sm:w-40 h-40 flex items-center justify-center bg-surface-variant rounded-lg border border-outline-variant/20 flex-shrink-0 text-outline">
                                <Camera className="h-10 w-10 opacity-30" />
                              </div>
                            )}
                            <div className="flex flex-col justify-center space-y-3 flex-1">
                              <h2 className="text-[24px] font-headline-md font-semibold text-on-surface">{r.title}</h2>
                              <div className="space-y-1.5 text-on-surface-variant text-[14px] font-body-md">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-primary-dim shrink-0" />
                                  <span className="truncate">Found at: <strong className="text-on-surface font-medium">{r.location}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary-dim shrink-0" />
                                  <span>Date Logged: <strong className="text-on-surface font-medium">{r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : 'Recent'}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Tag className="h-4 w-4 text-primary-dim shrink-0" />
                                  <span>Item ID: <strong className="text-on-surface font-medium uppercase text-xs">FT-{r.id.substring(0,6)}</strong></span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Verification Challenge Box */}
                          <div className="bg-surface-container-low p-6 rounded-xl border-l-4 border-primary shadow-sm relative overflow-hidden">
                            <Info className="absolute -right-4 -bottom-4 h-[120px] w-[120px] text-primary/5 select-none pointer-events-none" />
                            <div className="relative z-10">
                              <h3 className="text-[12px] font-label-md text-primary tracking-widest uppercase mb-3 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Verification Question
                              </h3>
                              <p className="text-[16px] font-body-lg text-on-surface italic bg-surface-container-highest/50 p-4 rounded-lg border border-outline-variant/20">
                                "{r.securityQuestion || 'Describe this item in enough detail to prove ownership (e.g. scratches, contents, background).'}"
                              </p>
                            </div>
                          </div>

                          {/* User Input Form */}
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const answer = (form.elements.namedItem('claimAnswer') as HTMLTextAreaElement).value;
                            handleSubmitClaim(r.id, r.userId, r.securityQuestion || 'Describe this item in enough detail to prove ownership (e.g. scratches, contents, background).', answer);
                          }} className="space-y-4">
                            <div>
                              <label htmlFor="claimAnswer" className="block text-[12px] font-label-md font-medium text-on-surface mb-2">Your Answer</label>
                              <textarea
                                id="claimAnswer"
                                name="claimAnswer"
                                required
                                rows={5}
                                placeholder="Please provide specific details to prove ownership..."
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-4 text-[14px] font-body-md text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-y shadow-inner"
                              ></textarea>
                            </div>

                            {/* Helper Text */}
                            <div className="flex items-start gap-3 p-3 bg-secondary-fixed/30 rounded-lg border border-secondary-fixed-dim/50">
                              <Info className="h-5 w-5 text-secondary-dim shrink-0 mt-0.5" />
                              <p className="text-[14px] font-body-md text-on-secondary-container leading-relaxed">
                                The finder will inspect this proof and action your contact credentials request. <span className="font-medium text-error-dim">False claims may result in account suspension.</span>
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-4 pt-6 border-t border-outline-variant/30 mt-8">
                              <button
                                type="button"
                                onClick={() => setActiveTab("itemDetail")}
                                className="px-6 py-2.5 text-[12px] font-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="flex items-center gap-2 bg-primary text-on-primary px-8 py-2.5 rounded-lg text-[12px] font-label-md hover:bg-primary-dim hover:shadow-md transition-all active:scale-95 group"
                              >
                                Submit Claim
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Contextual Helper (Right Column) */}
                        <div className="lg:col-span-4 mt-6 lg:mt-0">
                          <div className="bg-surface-container-highest rounded-xl p-6 border border-tertiary-fixed/40 shadow-sm relative overflow-hidden group">
                            {/* Top Accent Bar */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-tertiary-fixed"></div>
                            <div className="flex items-center gap-3 mb-4 mt-2">
                              <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
                                <Lightbulb className="h-5 w-5" fill="currentColor" />
                              </div>
                              <h3 className="text-[18px] font-headline-md font-semibold text-on-surface">Tips for a Strong Claim</h3>
                            </div>
                            <ul className="space-y-4 mt-6">
                              <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-tertiary-dim mt-0.5 shrink-0" />
                                <div>
                                  <strong className="block text-[12px] font-label-md text-on-surface">Be Specific</strong>
                                  <span className="text-[14px] font-body-md text-on-surface-variant">Mention unique marks, exact brand names, or highly specific contents.</span>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-tertiary-dim mt-0.5 shrink-0" />
                                <div>
                                  <strong className="block text-[12px] font-label-md text-on-surface">Provide Context</strong>
                                  <span className="text-[14px] font-body-md text-on-surface-variant">If relevant to the question, describe exactly where or when the item was lost.</span>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-tertiary-dim mt-0.5 shrink-0" />
                                <div>
                                  <strong className="block text-[12px] font-label-md text-on-surface">Be Patient</strong>
                                  <span className="text-[14px] font-body-md text-on-surface-variant">Finders are community volunteers; review times may vary based on their availability.</span>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </section>
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced itemDetail and claimItem panels');
