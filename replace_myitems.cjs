const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = '{/* PANEL: MY ITEMS */}';
const endTag = '{/* PANEL: PINNED ITEMS */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `{/* PANEL: MY ITEMS */}
            <section
              id="myitems"
              className={\`\${activeTab === "myitems" ? "block" : "hidden"} flex-1 flex flex-col min-w-0 bg-background overflow-y-auto\`}
            >
              <div className="p-4 md:p-8">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                  <div>
                    <h2 className="font-headline-lg text-3xl font-bold text-on-background mb-1">My Items</h2>
                    <p className="font-body-lg text-on-surface-variant">Manage and track your reported lost or found items.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("report")}
                    className="flex items-center gap-2 px-4 py-2 font-label-md font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-dim transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" /> Report New
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-8 border-b border-outline-variant mb-8 overflow-x-auto pb-px">
                  <button className="font-label-md text-sm text-primary border-b-2 border-primary pb-3 px-1 whitespace-nowrap">
                    Active ({items.filter(i => i.userId === auth.currentUser?.uid && !i.claimed).length})
                  </button>
                  <button className="font-label-md text-sm text-on-surface-variant hover:text-primary transition-colors pb-3 px-1 whitespace-nowrap">
                    Resolved ({items.filter(i => i.userId === auth.currentUser?.uid && i.claimed).length})
                  </button>
                </div>

                {/* Bento Grid List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items
                    .filter((item) => item.userId === auth.currentUser?.uid)
                    .map((r) => {
                      return (
                        <article key={r.id} className="bg-surface-container-lowest rounded-[16px] p-4 md:p-6 shadow-[0_4px_24px_rgba(1,114,90,0.08)] hover:shadow-[0_8px_32px_rgba(1,114,90,0.12)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full border border-surface-variant group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-2">
                              {r.claimed ? (
                                <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider flex items-center space-x-1">
                                  <CheckCircle2 className="h-[14px] w-[14px]" />
                                  <span>Match Found</span>
                                </span>
                              ) : r.type === "found" ? (
                                <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider flex items-center space-x-1">
                                  <Hand className="h-[14px] w-[14px]" />
                                  <span>Found</span>
                                </span>
                              ) : (
                                <span className="bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded-full font-label-md text-[10px] uppercase tracking-wider flex items-center space-x-1">
                                  <Search className="h-[14px] w-[14px] animate-pulse" />
                                  <span>Searching</span>
                                </span>
                              )}
                              <span className="text-on-surface-variant font-label-md text-xs">
                                {r.type === 'found' ? 'Found' : 'Lost'} • {r.createdAt ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <button 
                              onClick={() => deleteItem(r.id)}
                              className="text-on-surface-variant hover:text-error transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          
                          <div 
                            className="flex space-x-4 mb-4 flex-1 cursor-pointer"
                            onClick={() => {
                              setSelectedItemId(r.id);
                              setActiveTab("itemDetail");
                            }}
                          >
                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container flex items-center justify-center text-outline-variant">
                              {r.image || r.imageUrl ? (
                                <img src={r.image || r.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                              ) : (
                                <Image className="h-10 w-10 opacity-30" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-headline-md text-lg font-bold text-on-surface mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                {r.title}
                              </h3>
                              <div className="flex items-center space-x-1 mt-2 text-primary">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span className="font-label-md text-[11px] truncate">{r.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t border-outline-variant flex space-x-3 mt-auto">
                            {r.claimed ? (
                              <>
                                <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-label-md text-sm hover:bg-primary-dim transition-colors flex items-center justify-center space-x-2">
                                  <MessageSquare className="h-[18px] w-[18px]" />
                                  <span>Message Finder</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => {
                                    setSelectedItemId(r.id);
                                    setActiveTab("itemDetail");
                                  }}
                                  className="flex-1 border border-primary text-primary py-2 rounded-lg font-label-md text-sm hover:bg-surface-container transition-colors flex items-center justify-center space-x-2"
                                >
                                  <Eye className="h-[18px] w-[18px]" />
                                  <span>View Details</span>
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  
                  {items.filter((item) => item.userId === auth.currentUser?.uid).length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
                      <Inbox className="h-12 w-12 text-outline mx-auto mb-4" />
                      <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">No items yet</h3>
                      <p className="font-body-md text-on-surface-variant mb-6">You haven't reported any lost or found items.</p>
                      <button 
                        onClick={() => setActiveTab("report")}
                        className="inline-flex items-center gap-2 px-6 py-2.5 font-label-md font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-dim transition-colors"
                      >
                        <PlusCircle className="h-4 w-4" /> Report an Item
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced myitems');
