const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = '{/* PANEL: NOTIFICATIONS & ALERTS */}';
const endTag = '{/* PANEL: PROFILE */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `{/* PANEL: NOTIFICATIONS & ALERTS */}
            <section
              id="notifications"
              className={\`\${activeTab === "notifications" ? "block" : "hidden"} flex-1 flex flex-col min-w-0\`}
            >
              <div className="pt-8 px-4 md:px-8 pb-32 max-w-5xl mx-auto w-full">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div>
                    <h2 className="font-headline-lg text-3xl font-bold text-on-background mb-2">Alerts & Notifications</h2>
                    <p className="font-body-md text-on-surface-variant">Stay updated on your reported items and community activity.</p>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    <button 
                      onClick={() => markAllAlertsRead()}
                      className="px-4 py-2 rounded-full border border-outline-variant font-label-md text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                    >
                      Mark all read
                    </button>
                    <button className="px-4 py-2 rounded-full border border-outline-variant font-label-md text-sm text-on-surface-variant hover:bg-surface-variant transition-colors flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      Filter
                    </button>
                  </div>
                </div>

                {/* Bento Grid Layout for Alerts */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* High Priority Alert - Spans full width on mobile, 8 cols on desktop */}
                  <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 left-0 w-1 h-full bg-error-container"></div>
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-error-container/20 flex items-center justify-center flex-shrink-0 text-error-container">
                        <AlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-headline-md text-lg text-on-background">Community Safety Alert</h3>
                          <span className="font-label-md text-xs text-on-surface-variant whitespace-nowrap ml-2">Just now</span>
                        </div>
                        <p className="font-body-md text-on-surface mb-3">Increase in reported lost keys in the Downtown Business District. Please ensure your belongings are secure.</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-surface-variant text-on-surface-variant font-label-md text-[10px] uppercase tracking-wider">Announcement</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stat / Summary Card */}
                  <div className="md:col-span-4 bg-primary text-on-primary rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                      <Bell className="w-[120px] h-[120px]" />
                    </div>
                    <div>
                      <h3 className="font-headline-md text-lg text-on-primary mb-1">Unread Alerts</h3>
                      <p className="font-body-md text-primary-fixed-dim opacity-90">You have new activity</p>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-headline-lg text-5xl font-bold leading-none">{notifications.filter(n => !n.read).length}</span>
                      <span className="font-body-md opacity-90">Pending reviews</span>
                    </div>
                  </div>

                  {notifications.map((notif) => {
                    const isUnread = !notif.read;
                    const isMatch = notif.message.toLowerCase().includes("match");
                    const isClaim = notif.message.toLowerCase().includes("claim");
                    
                    return (
                      <div 
                        key={notif.id}
                        onClick={() => markAlertRead(notif.id)}
                        className={\`md:col-span-6 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/30 hover:shadow-md transition-shadow relative cursor-pointer \${!isUnread ? "opacity-80" : ""}\`}
                      >
                        {isUnread && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary"></div>}
                        <div className="flex gap-4">
                          <div className={\`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 \${
                            isMatch ? "bg-primary-container text-on-primary-container" : 
                            isClaim ? "bg-secondary-container text-on-secondary-container" : 
                            "bg-surface-variant text-on-surface-variant"
                          }\`}>
                            {isMatch ? <Search className="h-6 w-6" /> : isClaim ? <CheckCircle2 className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-headline-md text-lg text-on-background">
                                {isMatch ? "Potential Match Found!" : isClaim ? "Item Claimed" : "New Message"}
                              </h3>
                              <span className="font-label-md text-xs text-on-surface-variant">
                                {notif.timestamp ? new Date(notif.timestamp.seconds ? notif.timestamp.seconds * 1000 : notif.timestamp).toLocaleDateString() : 'Recently'}
                              </span>
                            </div>
                            <p className="font-body-md text-sm text-on-surface mb-3 line-clamp-2">{notif.message}</p>
                            
                            {isMatch && (
                              <div className="bg-surface-container rounded-lg p-3 flex items-center gap-3 mt-2">
                                <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center">
                                  <Image className="h-5 w-5 text-outline" />
                                </div>
                                <div>
                                  <p className="font-label-md text-xs font-bold text-on-surface">Review Match</p>
                                  <p className="font-label-md text-[10px] text-on-surface-variant">Tap to view details</p>
                                </div>
                                <button className="ml-auto text-primary hover:bg-surface-variant p-2 rounded-full transition-colors">
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                            
                            {isClaim && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary-fixed-dim text-on-secondary-fixed font-label-md text-[11px]">
                                  <CheckCircle2 className="h-3 w-3 mr-1" /> Closed
                                </span>
                                <button className="text-secondary hover:underline font-label-md text-sm">View details</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {notifications.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
                      <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 border border-outline-variant">
                        <Bell className="h-8 w-8 text-outline" />
                      </div>
                      <h3 className="font-headline-md text-lg font-bold text-on-surface mb-2">You're all caught up</h3>
                      <p className="font-body-md text-on-surface-variant">There are no new notifications or alerts at this time.</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <button className="px-6 py-2 rounded-full bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors font-label-md text-sm shadow-sm">
                      Load Older Alerts
                    </button>
                  </div>
                )}
              </div>
            </section>

`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced alerts');
