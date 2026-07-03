const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block font-label-md text-sm text-on-surface-variant mb-2" htmlFor="profBio">Bio</label>
                          <textarea 
                            className="w-full bg-surface-container-lowest border border-outline rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-shadow font-body-md" 
                            id="profBio" 
                            rows={3}
                            placeholder="Tell the community a bit about yourself..."
                            value={profileBio}
                            onChange={(e) => setProfileBio(e.target.value)}
                          ></textarea>
                        </div>`;

code = code.replace(`                            />
                          </div>
                        </div>`, replacement);

fs.writeFileSync('src/App.tsx', code);
