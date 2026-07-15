const fs = require('fs');

let content = fs.readFileSync('src/components/ItemCard.tsx', 'utf8');

const replacements = {
  'border-slate-250': 'border-outline-variant',
  'bg-white': 'bg-surface-container-lowest',
  'hover:border-indigo-200': 'hover:border-primary/50',
  'hover:shadow-indigo-50/50': '',
  'bg-rose-50 ': 'bg-error-container/20 ',
  'text-rose-700': 'text-error',
  'border-rose-100': 'border-error/30',
  'bg-emerald-50 ': 'bg-primary-container/20 ',
  'text-emerald-800': 'text-primary-dim',
  'border-emerald-150': 'border-primary/30',
  'bg-rose-505': 'bg-error',
  'bg-emerald-505': 'bg-primary',
  'text-slate-400': 'text-on-surface-variant/70',
  'border-slate-100': 'border-outline-variant/30',
  'bg-slate-50': 'bg-surface-container-low',
  'bg-rose-50/50': 'bg-error-container/10',
  'text-rose-500': 'text-error',
  'bg-emerald-50/55': 'bg-primary-container/10',
  'text-emerald-600': 'text-primary',
  'text-slate-900': 'text-on-surface',
  'group-hover:text-indigo-600': 'group-hover:text-primary',
  'text-slate-500': 'text-on-surface-variant',
  'bg-white/70': 'bg-surface-container-lowest/70',
  'bg-slate-900': 'bg-on-surface',
  'text-emerald-400': 'text-primary-container'
};

for (const [k, v] of Object.entries(replacements)) {
  content = content.replace(new RegExp(k, 'g'), v);
}

fs.writeFileSync('src/components/ItemCard.tsx', content);
