# Portal Data Kota Tangerang

Portal data publik berbasis CKAN dengan frontend React/Vite dan backend CodeIgniter 4. Repository ini menggabungkan tiga area utama:

- `portal-frontend/`: aplikasi React untuk halaman publik dan admin.
- `portal-api/`: backend CodeIgniter 4 yang menyajikan build frontend dan menjadi proxy API ke CKAN.
- `docker-ckan/`: stack CKAN beserta service pendukungnya.

## Ringkasan Arsitektur

1. Browser membuka route publik seperti `/`, `/organisasi`, `/publikasi`, `/topik`, `/pencarian`, `/login`, atau `/admin`.
2. CodeIgniter 4 melalui `Frontend::index` mengirimkan `public/frontend/index.html`.
3. React merender UI di browser dan mengambil data ke endpoint backend `/api/*`.
4. Backend meneruskan request tertentu ke CKAN, lalu mengembalikan JSON yang sudah aman dipakai frontend.

## Fitur Utama Saat Ini

- Landing page portal dengan statistik dinamis.
- Halaman `Organisasi` berbasis data CKAN.
- Halaman `Topik` dengan grouping organisasi ke topik tetap.
- Halaman `Publikasi` dengan filter kategori, tahun, dan judul.
- Halaman `Pencarian` untuk data lintas konten.
- Login admin dan manajemen dataset.
- Counter pengunjung sederhana via SQLite di `portal-api/writable/analytics`.

## Struktur Route

### Route frontend

- `/`
- `/organisasi`
- `/publikasi`
- `/topik`
- `/pencarian`
- `/login`
- `/admin`
- `/dataset/:id`

### Route API utama

- `GET /api/datasets`
- `GET /api/organizations`
- `GET /api/dataset/:id`
- `GET /api/search?q=...`
- `GET /api/preview/:id`
- `GET /api/visitors`
- `POST /api/visitors/increment`
- `POST /api/login`
- `POST /api/admin/dataset`
- `PUT /api/admin/dataset/:id`
- `DELETE /api/admin/dataset/:id`

## Stack

| Area | Teknologi |
| --- | --- |
| Frontend | React 19, Vite 8, Axios, Bootstrap 5 |
| Backend | CodeIgniter 4, PHP, Firebase JWT |
| Data catalog | CKAN |
| Support | PostgreSQL, Solr, Redis, Datapusher |
| Container | Docker Compose |

## Menjalankan Project

### Full stack via Docker

1. Siapkan file environment sesuai kebutuhan di `docker-ckan/compose/config/`.
2. Jalankan stack:

```bash
docker compose -f docker-ckan/compose/docker-compose.yml up -d
```

3. Akses:

- Portal: `http://localhost:8081`
- CKAN: `http://localhost:5000`

### Development frontend

```bash
cd portal-frontend
npm install
npm run dev
```

Catatan:
- Saat development, frontend default mengarah ke `http://localhost:8081`.
- Untuk build yang dipakai CodeIgniter:

```bash
cd portal-frontend
npm run build:portal
```

## File Penting

- `portal-frontend/src/App.jsx`: routing view frontend.
- `portal-frontend/src/utils/ckan.js`: client API frontend ke backend.
- `portal-frontend/src/utils/topics.js`: definisi topik tetap dan helper pencocokan.
- `portal-api/app/Config/Routes.php`: daftar route frontend dan API.
- `portal-api/app/Controllers/Dataset.php`: proxy backend ke CKAN.
- `portal-api/app/Controllers/Visitor.php`: counter pengunjung.
- `portal-api/app/Controllers/Frontend.php`: penyaji build React production.

## Dokumentasi Tambahan

- [DOKUMENTASI_INDEX.md](./DOKUMENTASI_INDEX.md)
- [ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md](./ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md)
- [DIAGRAM_ARSITEKTUR_VISUAL.md](./DIAGRAM_ARSITEKTUR_VISUAL.md)
- [TODO.md](./TODO.md)

