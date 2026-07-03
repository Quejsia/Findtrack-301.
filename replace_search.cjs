const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = '{/* PANEL: SEARCH REGISTRY */}';
const endTag = '{/* PANEL: ITEM DETAIL VIEW */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `{/* PANEL: SEARCH REGISTRY */}
            <section
              id="search"
              className={\`\${activeTab === "search" ? "block" : "hidden"} flex-1 flex flex-col min-w-0 bg-background overflow-y-auto\`}
            >
              <div className="p-4 md:p-8">
                {/* Search Header & Filters (Bento Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-8">
                  {/* Large Search Hero */}
                  <div className="md:col-span-8 bg-surface-container-high rounded-xl p-6 md:p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 bg-cover bg-center"></div>
                    <div className="relative z-10">
                      <h2 className="font-headline-lg text-3xl font-bold text-primary mb-2">Find Lost Items</h2>
                      <p className="font-body-lg text-on-surface-variant mb-6">Search through our community database to find what you're looking for.</p>
                      <div className="relative flex items-center w-full shadow-sm rounded-lg overflow-hidden border border-outline-variant focus-within:border-primary transition-colors bg-surface">
                        <div className="pl-4 text-on-surface-variant">
                          <Search className="h-5 w-5" />
                        </div>
                        <input 
                          className="w-full px-4 py-4 bg-transparent border-none focus:ring-0 font-body-lg text-on-surface placeholder:text-on-surface-variant/50 outline-none" 
                          placeholder="Search by keywords, brands, or descriptions..." 
                          type="text"
                          value={sQuery}
                          onChange={(e) => setSQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="md:col-span-4 flex flex-col gap-4">
                    <div className="bg-surface-container rounded-xl p-4 flex-1 border border-outline-variant/30 flex flex-col justify-center hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider mb-1">Status</h3>
                          <select 
                            value={sFilter}
                            onChange={(e) => setSFilter(e.target.value)}
                            className="bg-transparent border-none p-0 font-headline-md text-lg text-primary focus:ring-0 cursor-pointer outline-none font-bold"
                          >
                            <option value="all">All Items</option>
                            <option value="lost">Lost Only</option>
                            <option value="found">Found Only</option>
                            <option value="claimed">Resolved</option>
                          </select>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                          <Filter className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-tertiary-container/20 rounded-xl p-4 flex-1 border border-tertiary-container/30 flex flex-col justify-center hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="w-full pr-2">
                          <h3 className="font-label-md text-xs text-tertiary uppercase tracking-wider mb-1">Location</h3>
                          <input 
                            value={sLoc}
                            onChange={(e) => setSLoc(e.target.value)}
                            placeholder="Type location..."
                            className="bg-transparent border-none p-0 w-full font-headline-md text-lg text-on-surface leading-tight focus:ring-0 outline-none placeholder:text-on-surface/50 font-bold"
                          />
                        </div>
                        <div className="w-10 h-10 shrink-0 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                          <MapPin className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Categories highlight info bar */}
                {categoryKeywords && (
                  <div className="mb-8 bg-primary-container/30 border border-primary-container/50 text-on-primary-container py-3 px-4 rounded-xl flex items-center justify-between">
                    <span className="font-body-md">Filtered by Category: <strong className="capitalize">{categoryKeywords[0]}</strong></span>
                    <button
                      onClick={() => setCategoryKeywords(null)}
                      className="font-label-md text-sm font-bold text-primary hover:text-primary-dim underline"
                    >
                      Clear Category Filter
                    </button>
                  </div>
                )}

                {/* SMART SUGGESTION MATCH BANNER COGNITIVE extraction */}
                {smartMatches.length > 0 && (
                  <div className="mb-8 bg-surface-container-low rounded-xl p-6 border border-primary-container shadow-sm">
                    <div className="flex items-center gap-2 text-primary font-headline-md font-bold mb-4">
                      <Bot className="h-6 w-6" />
                      Smart Suggestions — Possible matches
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {smartMatches.map(({ report, score }) => {
                        const pct = Math.round(score * 100);
                        return (
                          <div
                            key={report.id}
                            onClick={() => {
                              setSelectedItemId(report.id);
                              setActiveTab("itemDetail");
                            }}
                            className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant hover:border-primary cursor-pointer hover:shadow-md transition-all group"
                          >
                            <div className="font-headline-md text-base font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors line-clamp-1">{report.title}</div>
                            <div className="flex items-center text-sm text-on-surface-variant mb-2">
                              <MapPin className="h-3.5 w-3.5 mr-1" />{" "}
                              <span className="truncate">{report.location || "Unknown"}</span>
                            </div>
                            <div className="flex items-center text-xs font-bold text-primary">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{" "}
                              {pct}% AI Match Confidence
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Results Grid */}
                <div className="mb-6 flex justify-between items-end">
                  <h2 className="font-headline-md text-2xl font-bold text-on-surface">
                    Search Results <span className="text-on-surface-variant font-body-md font-normal ml-2 text-lg">({filteredSearchList.length} found)</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
                  {filteredSearchList.map((r) => {
                    const pinned = pinnedIds.includes(r.id);
                    return (
                      <div
                        key={r.id}
                        onClick={() => {
                          setSelectedItemId(r.id);
                          setActiveTab("itemDetail");
                        }}
                        className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer"
                      >
                        <div className="h-48 relative overflow-hidden bg-surface-variant flex items-center justify-center">
                          {r.image || r.imageUrl ? (
                            <img
                              src={r.image || r.imageUrl}
                              alt={r.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="opacity-30 text-outline">
                              <Camera className="h-12 w-12" />
                            </div>
                          )}
                          <div className={\`absolute top-3 left-3 px-3 py-1 rounded-full font-label-md text-xs font-semibold tracking-wide uppercase flex items-center gap-1 shadow-sm \${
                            r.claimed ? 'bg-primary-container text-on-primary-container' : 
                            r.type === 'found' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                          }\`}>
                            {r.claimed ? <CheckCircle2 className="h-[14px] w-[14px]" /> : r.type === "found" ? <CheckCircle2 className="h-[14px] w-[14px]" /> : <Search className="h-[14px] w-[14px]" />}
                            {r.claimed ? "CLAIMED" : r.type === "found" ? "Found" : "Lost"}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePin(r.id);
                            }}
                            className={\`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors \${pinned ? "bg-tertiary text-on-tertiary shadow-md" : "bg-surface/80 backdrop-blur-sm text-on-surface-variant hover:text-primary"}\`}
                          >
                            <MapPin className="h-[18px] w-[18px]" fill={pinned ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-headline-md text-base text-on-surface font-semibold line-clamp-1 group-hover:text-primary transition-colors">{r.title}</h3>
                          </div>
                          <p className="font-body-md text-on-surface-variant line-clamp-2 mb-4 text-sm">
                            {r.desc || r.description || "No description provided."}
                          </p>
                          <div className="mt-auto space-y-2">
                            <div className="flex items-center text-xs text-on-surface-variant">
                              <MapPin className="h-[14px] w-[14px] mr-1 text-primary shrink-0" />
                              <span className="truncate">{r.location || "Unknown location"}</span>
                            </div>
                            <div className="flex items-center text-xs text-on-surface-variant">
                              <Clock className="h-[14px] w-[14px] mr-1 text-primary shrink-0" />
                              <span>{r.date
                                ? new Date(r.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : "Recent"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-lowest">
                          <button className={\`w-full py-2 rounded font-label-md text-sm transition-colors text-center block shadow-sm \${
                            r.type === 'found' ? 'bg-primary text-on-primary hover:bg-primary-dim' : 'border border-primary text-primary hover:bg-primary-container/20'
                          }\`}>
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredSearchList.length === 0 && (
                  <div className="py-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
                    <div className="w-16 h-16 bg-primary-container/30 rounded-full flex items-center justify-center mb-4 border border-primary-container">
                      <Search className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">No items found</h3>
                    <p className="font-body-md text-on-surface-variant">Try adjusting your search filters or keywords.</p>
                  </div>
                )}
              </div>
            </section>
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced search');
