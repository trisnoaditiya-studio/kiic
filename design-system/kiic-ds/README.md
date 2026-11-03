# KIIC Design System v1.0.0

Fondasi visual website KIIC (kiic.co.id). Style: Corporate Professional + industrial. Light mode, responsive 375–1440px, Bahasa Indonesia. Output: HTML + Tailwind CSS v3.4 untuk tema WordPress.

Buka `dist/style-guide.html` untuk melihat semua token dan komponen secara langsung.

## Struktur

```
tokens/design-tokens.json   Single source of truth (semua nilai)
scripts/build-tokens.mjs    JSON → src/tokens.css + audit kontras WCAG (build gagal jika ada yang tidak lulus)
tailwind.config.js          Memetakan token ke utility Tailwind (lewat CSS variables, tanpa hex)
src/kiic-ds.css             Base + component layer (class k-*)
src/kiic-ds.js              Perilaku interaktif (vanilla JS, tanpa dependensi)
src/fonts.css, fonts/       Manrope self-host
components/*.html           22 komponen, snippet siap tempel ke template PHP
dist/                       kiic-ds.css (minified), kiic-ds.js, style-guide.html, contrast-report.txt
```

## Cara pakai

```
npm install
npm run build     # tokens → audit kontras → compile CSS → style guide
npm run watch     # saat mengembangkan template
```

Di tema WordPress: tambahkan path template ke `content` di `tailwind.config.js` (sudah ada `./wp-theme/**/*.php`), lalu enqueue `fonts.css`, `kiic-ds.css`, dan `kiic-ds.js` (footer, `defer`).

Mengubah warna, ukuran teks, atau spasi: edit `tokens/design-tokens.json` saja, lalu `npm run build`.

## Token

| Kelompok | Jumlah | Catatan |
| --- | --- | --- |
| Warna primitive | 46 | red, navy, steel (11 stop), green, amber, crimson |
| Warna semantic | 44 | surface, fg, line, action, brand, status |
| Text style | 15 | display-xl s.d. caption, plus stat dan stat-unit; ukuran fluid via clamp() |
| Spasi | 22 | grid 4px, plus section-y dan gutter yang fluid |
| Radius / shadow / motion | 4 / 3 / 5 | radius default 4px |

Aturan warna: navy-700 #004884 dominan; merah brand #FE0000 hanya untuk aksen grafis dan teks besar (kontras 4,03:1); tombol dan teks merah memakai red-600 #E00000 (5,04:1). Danger memakai crimson agar tidak tertukar dengan CTA.

## Komponen

Typography, Button, Input (input, select, textarea), Badge, Card, Navbar, Mega Menu, Breadcrumb, Dropdown, Modal, Form kunjungan lokasi (checkbox, radio, error summary), Table, Toast, Tabs, Avatar, Hero video background, Proof bar, Spec card, Property card, Tenant logo wall, Testimonial, Footer.

Elemen interaktif punya state hover, focus-visible, disabled, dan error/invalid di tempat yang relevan. Property card punya status tersedia, terbatas, dan penuh.

## Data yang perlu dikonfirmasi ke KIIC

Angka di komponen diambil dari situs existing atau ditandai contoh: jarak ke Jakarta (situs menyebut 50 km dan 56 km), jumlah pekerja (±60.000), data properti, testimonial, logo tenant, logo resmi KIIC, dan footage drone untuk hero.
