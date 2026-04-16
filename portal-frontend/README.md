# Portal Frontend

Frontend portal dibangun dengan React + Vite dan dipakai untuk halaman publik maupun admin ringan.

## Script

```bash
npm install
npm run dev
npm run build
npm run build:portal
npm run preview
```

## Fungsi Script

- `npm run dev`: menjalankan Vite dev server.
- `npm run build`: build production standar.
- `npm run build:portal`: build untuk dipakai backend CodeIgniter.
- `npm run preview`: preview hasil build.

## Halaman Utama

- `Home`
- `Organisasi`
- `Topik`
- `Publikasi`
- `Search`
- `Login`
- `Admin`

## File Penting

- `src/App.jsx`: view switching berbasis path browser.
- `src/utils/ckan.js`: akses API backend.
- `src/utils/topics.js`: definisi topik.
- `src/utils/publications.js`: util publikasi berbasis local storage.
- `src/styles/`: seluruh styling halaman dan komponen.

## Catatan Implementasi

- Frontend production disajikan oleh CodeIgniter dari folder `portal-api/public/frontend`.
- Untuk sinkronisasi ke backend, jalankan `npm run build:portal`.
- Statistik di home mengambil gabungan data CKAN, definisi topik, dan publikasi lokal.

