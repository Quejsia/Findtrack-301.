const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /Image as ImageIcon \} from "lucide-react"/,
  'Image as ImageIcon, LogIn } from "lucide-react"'
);

fs.writeFileSync('src/App.tsx', app);
