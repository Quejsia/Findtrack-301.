const fs = require('fs');
let content = fs.readFileSync('src/components/SubmissionForm.tsx', 'utf8');

if (!content.includes("import { useTranslation } from 'react-i18next'")) {
  content = content.replace(
    /import React, \{ useState, useRef \} from 'react';/,
    "import React, { useState, useRef } from 'react';\nimport { useTranslation } from 'react-i18next';"
  );
  fs.writeFileSync('src/components/SubmissionForm.tsx', content);
  console.log("Fixed import in SubmissionForm");
}
