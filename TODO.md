# Panduan Edit Frontend Portal (React.js + CodeIgniter 4 + Bootstrap)

## Status: ✅ Selesai - Portal sudah mirip halaman home Satudata Jakarta!

### Posisi Stack Saat Ini:
- `React.js`: komponen dan interaktivitas frontend
- `Bootstrap`: warna, tombol, dan tata letak
- `CodeIgniter 4`: renderer halaman HTML dan backend JWT ke CKAN
- `CodeIgniter 4`: menyajikan frontend React hasil build pada runtime

### File yang Sudah Diubah:
- `portal-frontend/index.html`: Struktur lengkap Jakarta (SEO, metas, script analytics, console disable prod, Google Translate, GTM, GA4, ContentSquare)
- `portal-frontend/vite.config.js`: Build prod optimal (chunking vendors/app, minify)
- `portal-frontend/src/styles/index.css`: Warna utama #1e40af Jakarta
- `portal-frontend/public/favicon.ico`: Favicon ditambahkan

### 🎯 Tahapan Edit Lanjutan (Gunakan VS Code):

| Fitur | File | Cara Edit |
|-------|------|-----------|
| **Judul & SEO** | `index.html` (bagian `<head>`) | Ubah `title`, `meta description`, `keywords`, `og:title/url/image`, `twitter:site` |
| **Analytics** | `index.html` (script GTM/gtag) | Ganti `'GTM-KB8M88GD'` → ID GTM milikmu<br>`'G-9LVDVR9NCM'` → GA4 milikmu |
| **Console Disable** | `index.html` (script pertama) | Tambah domainmu di `isProduction`: `hostname === 'domainkamu.com'` |
| **Warna Tema** | `src/styles/index.css` (`:root`) & `index.html` | `--primary: #1e40af;` → warnamu<br>`theme-color` meta |
| **Favicon/Logo** | `public/favicon.ico` & `src/components/Navbar.jsx` | Ganti ICO<br>Ubah navbar brand text/img |
| **Google Translate** | `index.html` (script translate) & `src/pages/Home.jsx` | `pageLanguage: 'id'`, tambah `<div id="google_translate_element"></div>` di halaman |
| **Halaman/Rute** | `src/App.jsx` | Tambah `<Route path="/halamanbaru" element={<HalamanBaru />} />`<br>Buat `src/pages/HalamanBaru.jsx` |
| **Konten Halaman** | `src/pages/*.jsx` | `Home.jsx`, `OpenData.jsx`, `DatasetList.jsx` untuk isi halaman |
| **Navigasi** | `src/components/Navbar.jsx` | Tambah link di `<NavLink>` |
| **Style Custom** | `src/styles/App.css` | Override Bootstrap/CSS custom |
| **API Backend** | `portal-api/app/Controllers/` | `Dataset.php`, `Home.php` untuk CKAN data |
| **Grafik/Chart** | `src/components/StatsChart.jsx` | Edit Recharts data/component |

### 🚀 Test & Deploy:
1. **Build frontend production**: `cd portal-frontend && npm run build:portal`
2. **Preview Prod Build**: `npm run build && npm run preview` (chunks seperti Jakarta)
3. **Docker Full Runtime**: `docker compose up --build` (tanpa service frontend Node.js aktif secara default)

**Live sekarang**: frontend utama dirender oleh CodeIgniter 4 dan frontend portal production tersedia di `/app`.

Customisasi frontend dilakukan dari source React, lalu hasil build disajikan oleh CodeIgniter 4.
