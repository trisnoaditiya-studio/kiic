// Tailwind CSS v3.4 — semua nilai merujuk CSS variables dari src/tokens.css
// (yang di-generate dari tokens/design-tokens.json). Jangan tulis hex di sini.
const T = require('./tokens/design-tokens.json');

const primitives = {};
for (const [hue, val] of Object.entries(T.color.primitive)) {
  if (typeof val === 'string') primitives[hue] = `var(--c-${hue})`;
  else primitives[hue] = Object.fromEntries(Object.keys(val).map((s) => [s, `var(--c-${hue}-${s})`]));
}
const semantic = {};
for (const [group, items] of Object.entries(T.color.semantic))
  semantic[group] = Object.fromEntries(Object.keys(items).map((k) => [k === 'default' ? 'DEFAULT' : k, `var(--color-${group}-${k})`]));

const fontSize = Object.fromEntries(Object.keys(T.typography).map((k) => [k, [
  `var(--type-${k}-size)`,
  { lineHeight: `var(--type-${k}-leading)`, letterSpacing: `var(--type-${k}-tracking)`, fontWeight: `var(--type-${k}-weight)` },
]]));

module.exports = {
  content: ['./components/**/*.html', './src/**/*.js', './dist/_sg-body.html', './wp-theme/**/*.php'],
  theme: {
    screens: T.breakpoint,
    colors: { transparent: 'transparent', current: 'currentColor', ...primitives, ...semantic },
    fontFamily: { sans: 'var(--font-sans)' },
    fontSize,
    spacing: Object.fromEntries(Object.keys(T.spacing).map((k) => [k, `var(--space-${String(k).replace('.', '_')})`])),
    borderRadius: Object.fromEntries(Object.keys(T.radius).map((k) => [k === 'sm' ? 'DEFAULT' : k, `var(--radius-${k})`]).concat([['sm', 'var(--radius-sm)']])),
    boxShadow: { none: 'none', ...Object.fromEntries(Object.keys(T.shadow).map((k) => [k, `var(--shadow-${k})`])) },
    extend: {
      maxWidth: { container: 'var(--layout-container)', measure: 'var(--layout-measure)' },
      height: { nav: 'var(--layout-nav-height)' },
      transitionDuration: { fast: 'var(--duration-fast)', DEFAULT: 'var(--duration-base)', slow: 'var(--duration-slow)' },
      transitionTimingFunction: { DEFAULT: 'var(--ease-standard)', exit: 'var(--ease-exit)' },
      zIndex: Object.fromEntries(Object.keys(T.z).map((k) => [k, `var(--z-${k})`])),
    },
  },
  plugins: [],
};
