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
- Halaman `Organisasi` dapat membuka detail dataset, tabel DataStore, tombol download, dan grafik.
- Halaman `Topik` dengan grouping organisasi ke topik tetap.
- Halaman `Topik` membaca CKAN Groups, menampilkan jumlah dataset per topik, dan membuka detail dataset.
- Halaman `Publikasi` dengan filter kategori, tahun, dan judul.
- Halaman `Pencarian` untuk data lintas konten.
- Login admin dan manajemen dataset.
- Pembatasan visibility dataset CKAN agar editor hanya dapat membuat dataset `Private`.
- Workflow publikasi dataset CKAN dengan tombol aksi untuk editor, validator, verifikator, dan publikator.
- Role workflow CKAN dapat dipilih dari **Members** organisasi, dan role validator/verifikator/publikator dibuat readonly.
- Tabel dan grafik dataset membaca DataStore CKAN, termasuk kolom tahun seperti `Tahun 2015`.
- Baris header palsu dari Excel difilter agar tidak tampil sebagai data.
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
- `GET /api/topics`
- `GET /api/group-datasets?group=...`
- `GET /api/publications`
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
- `portal-frontend/src/pages/Topik.jsx`: halaman Topik, detail dataset, tabel, dan grafik.
- `portal-frontend/src/pages/Organisasi.jsx`: halaman Organisasi, detail dataset, tabel, dan grafik.
- `portal-frontend/src/components/DatasetLineChart.jsx`: grafik garis dataset.
- `portal-api/app/Config/Routes.php`: daftar route frontend dan API.
- `portal-api/app/Controllers/Dataset.php`: proxy backend ke CKAN.
- `portal-api/app/Controllers/Visitor.php`: counter pengunjung.
- `portal-api/app/Controllers/Frontend.php`: penyaji build React production.
- `docker-ckan/extensions/ckanext-restrict_visibility/`: extension CKAN untuk membatasi visibility dataset.
- `docker-ckan/extensions/ckanext-statsworkflow/`: extension CKAN untuk workflow validasi, verifikasi, revisi, dan publish dataset.

## Workflow Publikasi CKAN

Workflow publikasi berjalan di halaman detail dataset CKAN, bukan di form Custom Field manual. Status disimpan sebagai extras `stats_workflow_status`, tetapi perubahan status harus melalui action workflow agar alurnya tidak bisa dilompati.

Alur tombol:

- Editor: `draft` atau status revisi -> **Kirim ke Validator**.
- Validator: `waiting_validation` -> **Minta Revisi** atau **Setujui Validasi**.
- Verifikator: `waiting_verification` -> **Minta Revisi** atau **Setujui Verifikasi**.
- Publikator: `waiting_publish` -> **Publish**.

Role workflow dikelola dari halaman organisasi CKAN:

```text
Organisasi -> Members -> Add Member -> Role
```

Role tambahan yang tersedia:

- `Validator`
- `Verifikator`
- `Publikator`

Ketiga role tersebut readonly. Mereka bisa melihat dataset/resource internal organisasi, tetapi tidak bisa mengedit dataset, mengedit resource/file, atau menambah resource. Tombol **Edit resource** dan **Add new resource** juga disembunyikan dari UI untuk role tersebut.

Panel **Workflow Publikasi** ditambahkan oleh extension `ckanext-statsworkflow` di halaman:

```text
http://localhost:5000/dataset/<nama-dataset>
```

## Integrasi Topik dan DataStore

Halaman Topik portal terhubung ke CKAN Groups. Contoh group:

```text
sosial-dan-budaya
```

Endpoint backend yang dipakai:

```text
GET /api/topics
GET /api/group-datasets?group=sosial-dan-budaya
```

Ketika dataset dibuka dari Topik atau Organisasi, portal mengambil detail dataset dan preview resource dari DataStore:

```text
GET /api/dataset/:id
GET /api/preview/:resourceId
```

Frontend membaca kolom tahun dalam format seperti:

```text
Tahun 2015
Tahun 2016
...
Tahun 2025
```

Nilai tahun diformat mengikuti tampilan Excel, misalnya:

```text
77720 -> 77,720
79660 -> 79,660
100   -> 100
```

Jika DataStore mengirim baris header kedua dari Excel sebagai record, frontend memfilternya agar tidak tampil sebagai data dan tidak dipakai grafik.

## API Testing Cepat

Endpoint yang paling sering dites di Postman:

```text
GET  http://localhost:8081/api/datasets
GET  http://localhost:8081/api/topics
GET  http://localhost:8081/api/group-datasets?group=sosial-dan-budaya
GET  http://localhost:8081/api/preview/003a71e0-098a-4d65-858e-a5ebfd5923cc
GET  http://localhost:8081/api/visitors
POST http://localhost:8081/api/visitors/increment
POST http://localhost:8081/api/login
```

Body login portal:

```json
{
  "username": "admin",
  "password": "123456"
}
```

Endpoint CKAN pembanding:

```text
GET http://localhost:5000/api/3/action/status_show
GET http://localhost:5000/api/3/action/group_list?all_fields=true&include_dataset_count=true
GET http://localhost:5000/api/3/action/package_search?fq=groups:sosial-dan-budaya
GET http://localhost:5000/api/3/action/datastore_search?resource_id=003a71e0-098a-4d65-858e-a5ebfd5923cc&limit=20
```

## Dokumentasi Tambahan

- [DOKUMENTASI_INDEX.md](./DOKUMENTASI_INDEX.md)
- [ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md](./ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md)
- [DIAGRAM_ARSITEKTUR_VISUAL.md](./DIAGRAM_ARSITEKTUR_VISUAL.md)
- [TODO.md](./TODO.md)
