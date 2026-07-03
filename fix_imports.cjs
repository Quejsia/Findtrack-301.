const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/from "lucide-react"/, ', AlertTriangle, Star, Heart, TrendingUp, ArrowDownUp, FileText, Image as ImageIcon } from "lucide-react"');
code = code.replace(/<Image/g, '<ImageIcon');

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed imports and Image tags');
