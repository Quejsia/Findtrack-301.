const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /import React, \{ useState, useEffect, useRef, useMemo \} from "react";/,
  "import React, { useState, useEffect, useRef, useMemo } from 'react';\nimport { useTranslation } from 'react-i18next';\nimport SettingsPage from './pages/Settings';"
);

fs.writeFileSync('src/App.tsx', app);
