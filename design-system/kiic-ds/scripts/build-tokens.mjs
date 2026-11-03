// Membaca tokens/design-tokens.json → menulis src/tokens.css + audit kontras WCAG.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const T = JSON.parse(readFileSync(new URL('../tokens/design-tokens.json', import.meta.url)));
const lines = [];
const v = (name, value) => lines.push(`  --${name}: ${value};`);

// primitive color → --c-*
const prim = T.color.primitive;
const primVar = (path) => '--c-' + path.join('-');
for (const [hue, val] of Object.entries(prim)) {
  if (typeof val === 'string') v(primVar([hue]).slice(2), val);
  else for (const [stop, hex] of Object.entries(val)) v(primVar([hue, stop]).slice(2), hex);
}

// semantic color → --color-<group>-<name>, references primitive via var()
const ref = (s) => {
  const m = /^\{color\.primitive\.(.+)\}$/.exec(s);
  return m ? `var(${primVar(m[1].split('.'))})` : s;
};
for (const [group, items] of Object.entries(T.color.semantic))
  for (const [name, val] of Object.entries(items)) v(`color-${group}-${name}`, ref(val));

v('font-sans', T.font.family.sans);
v('font-numeric', T.font.feature.numeric);
for (const [k, s] of Object.entries(T.typography)) {
  v(`type-${k}-size`, s.size); v(`type-${k}-leading`, s.lineHeight);
  v(`type-${k}-weight`, s.weight); v(`type-${k}-tracking`, s.tracking);
}
for (const [k, s] of Object.entries(T.spacing)) v(`space-${String(k).replace('.', '_')}`, s);
for (const [k, s] of Object.entries(T.radius)) v(`radius-${k}`, s);
for (const [k, s] of Object.entries(T.shadow)) v(`shadow-${k}`, s);
for (const [k, s] of Object.entries(T.motion.duration)) v(`duration-${k}`, s);
for (const [k, s] of Object.entries(T.motion.easing)) v(`ease-${k}`, s);
for (const [k, s] of Object.entries(T.layout)) v(`layout-${k}`, s);
for (const [k, s] of Object.entries(T.z)) v(`z-${k}`, s);

mkdirSync(new URL('../src/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/tokens.css', import.meta.url),
  `/* GENERATED dari tokens/design-tokens.json — jangan edit manual. Jalankan: npm run tokens */\n:root {\n${lines.join('\n')}\n}\n`);

// ---------- Audit kontras ----------
const hex = (s) => {
  const m = /^\{color\.primitive\.(.+)\}$/.exec(s);
  if (!m) return s;
  return m[1].split('.').reduce((o, k) => o[k], prim);
};
const sem = (p) => hex(p.split('.').reduce((o, k) => o[k], T.color.semantic));
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ['fg.primary', 'surface.page', 4.5], ['fg.secondary', 'surface.page', 4.5], ['fg.muted', 'surface.page', 4.5],
  ['fg.secondary', 'surface.subtle', 4.5], ['fg.muted', 'surface.subtle', 4.5], ['fg.link', 'surface.page', 4.5],
  ['fg.accent', 'surface.page', 4.5], ['fg.inverse', 'action.primary', 4.5], ['fg.inverse', 'action.primary-hover', 4.5],
  ['fg.inverse', 'action.secondary', 4.5], ['fg.inverse', 'surface.brand', 4.5], ['fg.inverse-muted', 'surface.brand', 4.5],
  ['fg.inverse-muted', 'surface.brand-deep', 4.5], ['fg.inverse-muted', 'surface.footer', 4.5],
  ['status.success-fg', 'status.success-bg', 4.5], ['status.warning-fg', 'status.warning-bg', 4.5],
  ['status.danger-fg', 'status.danger-bg', 4.5], ['status.danger-fg', 'surface.page', 4.5], ['status.info-fg', 'status.info-bg', 4.5],
  ['line.focus', 'surface.page', 3], ['line.strong', 'surface.page', 1.0], ['brand.red', 'surface.page', 3],
];
let fail = 0;
const report = pairs.map(([f, b, min]) => {
  const r = cr(sem(f), sem(b)); const ok = r >= min; if (!ok) fail++;
  return `${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${f} on ${b}`;
});
writeFileSync(new URL('../dist/contrast-report.txt', import.meta.url), report.join('\n') + '\n');
console.log(report.join('\n'));
if (fail) { console.error(`\n${fail} pasangan gagal`); process.exit(1); }
