const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = '{/* PANEL: PINNED ITEMS */}';
const endTag = '{/* PANEL: CATEGORIES BROWSER */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `{/* PANEL: PINNED ITEMS */}
            <section
              id="pinned"
              className={\`\${activeTab === "pinned" ? "block" : "hidden"} flex-1 flex flex-col min-w-0\`}
            >
              <div className="pt-8 px-4 md:px-8 pb-32">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h2 className="font-headline-lg text-3xl font-bold text-on-background mb-2">Pinned Items</h2>
                    <p className="font-body-lg text-on-surface-variant max-w-2xl">Keep track of important community reports. Items you pin will appear here for quick access until they are resolved or you unpin them.</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-surface-container rounded-lg font-label-md text-sm text-on-surface flex items-center gap-2 hover:bg-surface-container-high transition-colors border border-outline-variant">
                      <Filter className="h-[18px] w-[18px]" />
                      Filter
                    </button>
                    <button className="px-4 py-2 bg-surface-container rounded-lg font-label-md text-sm text-on-surface flex items-center gap-2 hover:bg-surface-container-high transition-colors border border-outline-variant">
                      <ArrowDownUp className="h-[18px] w-[18px]" />
                      Sort
                    </button>
                  </div>
                </div>

                {/* Bento Grid for Pinned Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items
                    .filter((item) => pinnedIds.includes(item.id))
                    .map((r, i) => {
                      const isLarge = i % 5 === 0;
                      return (
                        <div 
                          key={r.id} 
                          className={\`\${isLarge ? "md:col-span-2 lg:col-span-2 row-span-2" : "col-span-1 row-span-1"} bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_-4px_rgba(1,114,90,0.08)] border border-outline-variant/30 overflow-hidden flex flex-col group relative transition-transform hover:-translate-y-1 duration-300 cursor-pointer\`}
                          onClick={() => {
                            setSelectedItemId(r.id);
                            setActiveTab("itemDetail");
                          }}
                        >
                          <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <span className={\`\${r.claimed ? 'bg-secondary-container text-on-secondary-container' : r.type === 'found' ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container'} px-3 py-1 rounded-full font-label-md text-[10px] font-bold tracking-wider uppercase shadow-sm\`}>
                              {r.claimed ? "Resolved" : r.type === "found" ? "Found" : "Lost"}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePin(r.id);
                              }}
                              className="bg-surface-container-lowest/80 backdrop-blur p-2 rounded-full text-primary hover:text-error transition-colors shadow-sm group/btn"
                              title="Unpin Item"
                            >
                              <MapPin className="h-4 w-4 fill-current group-hover/btn:hidden" />
                              <X className="h-4 w-4 hidden group-hover/btn:block text-error" />
                            </button>
                          </div>
                          
                          <div className={\`\${isLarge ? "h-64" : "h-48"} relative w-full overflow-hidden bg-surface-variant flex items-center justify-center\`}>
                            {r.image || r.imageUrl ? (
                              <>
                                <img
                                  src={r.image || r.imageUrl}
                                  alt={r.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  referrerPolicy="no-referrer"
                                />
                                {isLarge && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>}
                              </>
                            ) : (
                              <div className="w-full h-full border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline-variant p-4 m-4 rounded-lg bg-surface-container-lowest">
                                <Image className="h-10 w-10 mb-2 opacity-50" />
                                <span className="font-label-md text-xs text-center opacity-70">No Image Available</span>
                              </div>
                            )}
                            
                            {isLarge && (r.image || r.imageUrl) && (
                              <div className="absolute bottom-4 left-4 right-4 text-white">
                                <div className="flex items-center gap-2 mb-1 text-sm opacity-90">
                                  <MapPin className="h-[16px] w-[16px]" />
                                  <span>{r.location || "Unknown"}</span>
                                </div>
                                <h3 className="font-headline-md text-2xl font-bold leading-tight line-clamp-1">{r.title}</h3>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col">
                            {(!isLarge || (!r.image && !r.imageUrl)) && (
                              <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-1 line-clamp-1 group-hover:text-primary transition-colors">{r.title}</h3>
                            )}
                            
                            {(!isLarge || (!r.image && !r.imageUrl)) && (
                              <div className="flex items-center gap-1 text-on-surface-variant text-sm mb-3">
                                <MapPin className="h-[14px] w-[14px] text-primary" />
                                <span className="truncate">{r.location || "Unknown"}</span>
                              </div>
                            )}
                            
                            <p className="font-body-md text-on-surface-variant line-clamp-3 mb-4 text-sm">
                              {r.desc || r.description || "No description provided."}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-surface-variant flex justify-between items-center">
                              {isLarge ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-xs font-bold text-on-surface">
                                    {r.contactName ? r.contactName.charAt(0).toUpperCase() : "U"}
                                  </div>
                                  <span className="font-label-md text-xs text-on-surface">Reported by {r.contactName || "User"}</span>
                                </div>
                              ) : (
                                <span className="font-label-md text-xs text-outline flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Pinned {r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : 'Recently'}
                                </span>
                              )}
                              
                              <button className="text-primary font-label-md text-sm hover:underline flex items-center gap-1">
                                View Details {isLarge && <ArrowRight className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  {items.filter((item) => pinnedIds.includes(item.id)).length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
                      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant">
                        <MapPin className="h-8 w-8 text-outline" />
                      </div>
                      <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">No pinned items</h3>
                      <p className="font-body-md text-on-surface-variant mb-6">You haven't bookmarked any items yet.</p>
                      <button 
                        onClick={() => setActiveTab("search")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 font-label-md font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-dim transition-colors"
                      >
                        <Search className="h-4 w-4" /> Browse Items
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced pinned items');
