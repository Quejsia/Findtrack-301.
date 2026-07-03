const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startTag = '{/* PANEL: CATEGORIES BROWSER */}';
const endTag = '{/* PANEL: ANALYTICS DESK */}';
const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag, startIndex);
if (startIndex === -1 || endIndex === -1) {
    console.log('Could not find boundaries');
    process.exit(1);
}

const replacement = `{/* PANEL: CATEGORIES BROWSER */}
            <section
              id="categories"
              className={\`\${activeTab === "categories" ? "block" : "hidden"} flex-1 flex flex-col min-w-0\`}
            >
              <div className="pt-8 px-4 md:px-8 pb-32 max-w-7xl mx-auto w-full">
                {/* Page Header */}
                <div className="mb-12">
                  <h2 className="font-headline-lg text-4xl font-bold text-primary mb-2">Browse Categories</h2>
                  <p className="font-body-lg text-on-surface-variant max-w-2xl">Find what you're looking for by exploring our organized categories. We've classified items to help you navigate through reports efficiently.</p>
                </div>
                
                {/* Bento Grid for Categories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
                  {/* Electronics (Large Featured) */}
                  <div 
                    className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-8 flex flex-col justify-between group overflow-hidden relative border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["phone", "laptop", "tablet", "charger", "headphone", "earphone", "computer", "iphone", "samsung", "ipad", "macbook"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                      <Smartphone className="w-[300px] h-[300px] text-primary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-primary-container p-3 rounded-lg inline-flex">
                        <Smartphone className="text-on-primary-container h-8 w-8" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-xs px-3 py-1 rounded-full border border-outline-variant/20">
                        {items.filter(i => ["phone", "laptop", "tablet", "charger", "headphone", "earphone", "computer", "iphone", "samsung", "ipad", "macbook"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-headline-md text-3xl font-bold text-primary mb-2 group-hover:text-primary-dim transition-colors">Electronics</h3>
                      <p className="font-body-md text-base text-on-surface-variant max-w-sm">Phones, laptops, tablets, and other digital devices reported lost or found recently.</p>
                    </div>
                  </div>

                  {/* Bags & Luggage */}
                  <div 
                    className="col-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["bag", "backpack", "purse", "wallet", "luggage", "suitcase", "handbag"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                      <Package className="w-[150px] h-[150px] text-tertiary" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-tertiary-container p-2 rounded-lg inline-flex">
                        <Package className="text-on-tertiary-container h-6 w-6" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["bag", "backpack", "purse", "wallet", "luggage", "suitcase", "handbag"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-tertiary transition-colors">Bags & Luggage</h3>
                      <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">Backpacks, purses, suitcases and other carry-ons.</p>
                    </div>
                  </div>

                  {/* Pets */}
                  <div 
                    className="col-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["dog", "cat", "pet", "bird", "animal", "puppy", "kitten", "collar"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                      <Heart className="w-[150px] h-[150px] text-error" />
                    </div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-[#ffdcdc] p-2 rounded-lg inline-flex">
                        <Heart className="text-error h-6 w-6" fill="currentColor" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["dog", "cat", "pet", "bird", "animal", "puppy", "kitten", "collar"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-error transition-colors">Pets & Animals</h3>
                      <p className="font-body-md text-sm text-on-surface-variant line-clamp-2">Lost dogs, cats, and other companion animals.</p>
                    </div>
                  </div>

                  {/* Documents (Tall) */}
                  <div 
                    className="col-span-1 sm:col-span-1 row-span-2 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["document", "id", "passport", "license", "card", "paper", "folder"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent pointer-events-none"></div>
                    <div className="relative z-10 flex justify-between items-start mb-4">
                      <div className="bg-secondary-container p-3 rounded-lg inline-flex">
                        <FileText className="text-on-secondary-container h-8 w-8" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["document", "id", "passport", "license", "card", "paper", "folder"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-2xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">Documents & IDs</h3>
                      <p className="font-body-md text-sm text-on-surface-variant mb-4">Passports, driver's licenses, IDs, and important paperwork.</p>
                      <div className="flex items-center text-primary font-label-md text-xs group-hover:translate-x-1 transition-transform">
                        Explore <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Clothing */}
                  <div 
                    className="col-span-1 sm:col-span-1 row-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["jacket", "shirt", "pants", "uniform", "shoes", "hat", "scarf", "coat", "clothing"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-surface-variant p-2 rounded-lg inline-flex">
                        <Tag className="text-on-surface h-6 w-6" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["jacket", "shirt", "pants", "uniform", "shoes", "hat", "scarf", "coat", "clothing"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Clothing</h3>
                    </div>
                  </div>

                  {/* Jewelry & Watches */}
                  <div 
                    className="col-span-1 sm:col-span-1 row-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["ring", "necklace", "bracelet", "watch", "earring", "jewelry", "diamond", "gold", "silver"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-surface-variant p-2 rounded-lg inline-flex">
                        <Clock className="text-on-surface h-6 w-6" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["ring", "necklace", "bracelet", "watch", "earring", "jewelry", "diamond", "gold", "silver"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Jewelry & Watches</h3>
                    </div>
                  </div>

                  {/* Keys */}
                  <div 
                    className="col-span-1 sm:col-span-1 row-span-1 rounded-xl bg-surface-container-lowest shadow-[0_4px_20px_rgba(1,114,90,0.05)] hover:shadow-[0_8px_30px_rgba(1,114,90,0.1)] hover:-translate-y-1 p-6 flex flex-col justify-between group relative overflow-hidden border border-outline-variant/30 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setCategoryKeywords(["key", "keychain", "fob", "car key"]);
                      setActiveTab("search");
                    }}
                  >
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="bg-surface-variant p-2 rounded-lg inline-flex">
                        <Key className="text-on-surface h-6 w-6" />
                      </div>
                      <span className="bg-surface-variant text-on-surface-variant font-label-md text-[10px] px-2 py-1 rounded-full">
                        {items.filter(i => ["key", "keychain", "fob", "car key"].some(kw => i.title.toLowerCase().includes(kw) || i.desc?.toLowerCase().includes(kw))).length} Active
                      </span>
                    </div>
                    <div className="relative z-10 mt-auto">
                      <h3 className="font-body-lg text-lg font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">Keys</h3>
                    </div>
                  </div>
                </div>
              </div>
            </section>
`;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced categories');
