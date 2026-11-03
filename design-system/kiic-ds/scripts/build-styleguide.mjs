// Menyusun dist/style-guide.html (self-contained) dari tokens + components/*.html.
import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const T = JSON.parse(read('tokens/design-tokens.json'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- Foundations ----
const prim = T.color.primitive;
const ramps = Object.entries(prim).filter(([, v]) => typeof v === 'object').map(([hue, stops]) => `
  <div class="grid gap-2"><p class="text-label">${hue}</p>
    <div class="grid grid-cols-4 gap-1 md:grid-cols-6 lg:grid-cols-11">${Object.entries(stops).map(([s, hex]) => `
      <div class="grid gap-1"><div class="h-12 rounded border border-line" style="background:var(--c-${hue}-${s})"></div>
      <p class="text-caption"><span class="font-semibold">${s}</span><br><span class="text-fg-secondary k-num">${hex}</span></p></div>`).join('')}
    </div></div>`).join('');

const semRows = Object.entries(T.color.semantic).flatMap(([g, items]) => Object.entries(items).map(([k, v]) => `
  <tr><td><span class="inline-block h-6 w-10 rounded border border-line align-middle" style="background:var(--color-${g}-${k})"></span></td>
  <td><code>--color-${g}-${k}</code></td><td class="text-fg-secondary">${esc(v.replace('{color.primitive.', '').replace('}', ''))}</td></tr>`)).join('');

const contrast = read('dist/contrast-report.txt').trim().split('\n').map((l) => {
  const m = /^(PASS|FAIL)\s+([\d.]+):1\s+\(min ([\d.]+)\)\s+(\S+) on (\S+)$/.exec(l);
  return `<tr><td>${m[4]}</td><td>${m[5]}</td><td class="k-num">${m[2]}:1</td><td><span class="k-badge ${m[1] === 'PASS' ? 'k-badge-success' : 'k-badge-danger'}">${m[1] === 'PASS' ? 'Lulus' : 'Gagal'} (min ${m[3]})</span></td></tr>`;
}).join('');

const spacing = Object.entries(T.spacing).filter(([k]) => !isNaN(k) && k !== '0').map(([k, v]) => `
  <div class="flex items-center gap-4"><code class="w-32 text-body-sm">space-${k}</code><span class="w-20 text-caption text-fg-secondary k-num">${v}</span>
  <span class="h-3 rounded bg-navy-700" style="width:var(--space-${k.replace('.', '_')})"></span></div>`).join('');

const radius = Object.entries(T.radius).map(([k, v]) => `
  <div class="grid justify-items-start gap-2"><div class="h-16 w-24 border-2 border-navy-700 bg-navy-50" style="border-radius:var(--radius-${k})"></div><p class="text-caption"><code>radius-${k}</code> · ${v}</p></div>`).join('');
const shadow = Object.keys(T.shadow).map((k) => `
  <div class="grid h-24 place-items-center rounded bg-surface-page text-label" style="box-shadow:var(--shadow-${k})">shadow-${k}</div>`).join('');

// ---- Components ----
const files = readdirSync(new URL('components/', root)).filter((f) => f.endsWith('.html')).sort();
const comps = files.map((f) => {
  const src = read(`components/${f}`);
  const meta = /<!--\s*@name:\s*(.+?)\s*\|\s*@desc:\s*([\s\S]+?)\s*-->/.exec(src);
  const body = src.replace(meta[0], '').trim();
  const id = f.replace('.html', '');
  return { id, name: meta[1], desc: meta[2], body };
});
const nav = [['warna', 'Warna'], ['tipografi', 'Tipografi'], ['spasi', 'Spasi, radius, shadow'], ...comps.map((c) => [c.id, c.name])];

const body = `
<div class="lg:grid lg:grid-cols-[260px_1fr]">
  <aside class="border-b border-line bg-surface-subtle lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
    <div class="grid gap-1 p-6">
      <p class="mb-4 flex items-center gap-3 text-h6"><span class="k-nav-logo-mark" aria-hidden="true">K</span>KIIC Design System</p>
      <nav aria-label="Daftar isi" class="grid gap-1 text-body-sm max-lg:grid-cols-2">${nav.map(([id, n]) => `<a href="#${id}" class="rounded px-3 py-2 text-fg-primary hover:bg-action-ghost-hover" style="text-decoration:none">${n}</a>`).join('')}</nav>
    </div>
  </aside>
  <main class="min-w-0">
    <header class="k-masterplan-pattern k-on-dark px-6 py-16 text-fg-inverse lg:px-12">
      <p class="text-label text-fg-inverse-muted">Versi ${T.$meta.version} · ${T.$meta.updated}</p>
      <h1 class="mt-3 text-display-lg">KIIC Design System</h1>
      <p class="mt-4 max-w-measure text-body-lg text-navy-100">Fondasi visual website KIIC: Corporate Professional dengan karakter industrial. Navy sebagai warna dominan, merah KIIC sebagai aksen dan aksi utama, Manrope untuk seluruh teks.</p>
    </header>
    <div class="grid gap-20 px-6 py-16 lg:px-12">
      <section id="warna" class="grid gap-8">
        <div class="grid gap-3"><h2>Warna</h2><p class="k-lead">Navy (#004884) dominan untuk permukaan besar. Merah brand #FE0000 hanya untuk aksen grafis dan teks besar; tombol dan link merah memakai red-600 #E00000 agar lolos WCAG AA. Danger memakai crimson supaya tidak tertukar dengan CTA.</p></div>
        <div class="grid gap-6 md:grid-cols-3">
          <div class="grid gap-2"><div class="h-24 rounded" style="background:var(--color-surface-brand)"></div><p class="text-label">Dominan · navy-700</p><p class="text-caption text-fg-secondary">Header seksi, footer, overlay hero ±60%</p></div>
          <div class="grid gap-2"><div class="h-24 rounded border border-line" style="background:var(--color-surface-subtle)"></div><p class="text-label">Netral · steel</p><p class="text-caption text-fg-secondary">Latar halaman dan kartu ±30%</p></div>
          <div class="grid gap-2"><div class="h-24 rounded" style="background:var(--color-action-primary)"></div><p class="text-label">Aksen · red-600</p><p class="text-caption text-fg-secondary">CTA utama dan penanda ±10%</p></div>
        </div>
        <h3>Primitive</h3>${ramps}
        <h3>Semantic token</h3>
        <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Swatch</th><th>Token</th><th>Merujuk</th></tr></thead><tbody>${semRows}</tbody></table></div>
        <h3>Audit kontras WCAG</h3>
        <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Teks / elemen</th><th>Di atas</th><th class="k-num">Rasio</th><th>Hasil</th></tr></thead><tbody>${contrast}</tbody>
        <caption>Dihitung otomatis oleh scripts/build-tokens.mjs setiap build. Build gagal jika ada pasangan di bawah ambang.</caption></table></div>
      </section>
      <section id="tipografi" class="grid gap-8">
        <div class="grid gap-3"><h2>Tipografi</h2><p class="k-lead">Manrope variable (weight 200–800), satu keluarga untuk heading dan body. Ukuran fluid via clamp(). Angka memakai fitur tnum (tabular figures), sudah diverifikasi ada di file font.</p></div>
        <div class="k-table-wrap"><table class="k-table"><thead><tr><th>Style</th><th>Ukuran</th><th class="k-num">Line height</th><th class="k-num">Weight</th></tr></thead><tbody>
        ${Object.entries(T.typography).map(([k, s]) => `<tr><td><code>text-${k}</code></td><td class="text-fg-secondary"><code>${s.size}</code></td><td class="k-num">${s.lineHeight}</td><td class="k-num">${s.weight}</td></tr>`).join('')}
        </tbody></table></div>
      </section>
      <section id="spasi" class="grid gap-8">
        <div class="grid gap-3"><h2>Spasi, radius, shadow</h2><p class="k-lead">Grid 4px. Komponen rapat, jarak antar-seksi lega (space-section-y fluid 64–128px). Radius 4px sebagai default; 8px hanya untuk modal.</p></div>
        <div class="grid gap-3">${spacing}</div>
        <div class="flex flex-wrap gap-8">${radius}</div>
        <div class="grid gap-6 bg-surface-subtle p-6 md:grid-cols-3">${shadow}</div>
      </section>
      ${comps.map((c) => `
      <section id="${c.id}" class="grid gap-6 border-t border-line pt-12">
        <div class="grid gap-3"><h2>${c.name}</h2><p class="k-lead">${c.desc}</p></div>
        <div class="rounded border border-line p-6 lg:p-8" style="overflow:visible${c.id.includes("navbar") ? ";min-height:380px" : ""}">${c.body}</div>
        <details class="rounded border border-line"><summary class="cursor-pointer px-4 py-3 text-label">Lihat HTML</summary>
          <pre class="overflow-x-auto bg-steel-950 p-4 text-caption text-steel-100" style="margin:0"><code>${esc(c.body)}</code></pre></details>
      </section>`).join('')}
    </div>
  </main>
</div>`;

writeFileSync(new URL('dist/_sg-body.html', root), body);
execSync('npx tailwindcss -i src/kiic-ds.css -o dist/kiic-ds.css --minify', { cwd: root, stdio: 'inherit' });
copyFileSync(new URL('src/kiic-ds.js', root), new URL('dist/kiic-ds.js', root));

const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>KIIC Design System</title>
<style>@font-face { font-family: 'Manrope Variable'; font-style: normal; font-display: swap; font-weight: 200 800;
  src: url(data:font/woff2;base64,${readFileSync(new URL('fonts/manrope-latin-wght-normal.woff2', root)).toString('base64')}) format('woff2'); }
${read('dist/kiic-ds.css')}
:root { box-sizing: border-box; padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }
code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.875em; }</style>
</head><body>${body}
<script>${read('src/kiic-ds.js')}</script></body></html>`;
writeFileSync(new URL('dist/style-guide.html', root), html);
console.log('style-guide.html', (html.length / 1024).toFixed(0), 'KB');
