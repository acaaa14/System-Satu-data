# Alur Sistem Portal Data Kota Tangerang

Dokumen ini menjelaskan alur kerja sistem dari ujung ke ujung, lalu memecahnya menjadi alur frontend, backend portal, CKAN, workflow publikasi, autentikasi, dan infrastruktur. Tujuannya supaya developer baru bisa membaca sistem sebagai satu rangkaian, bukan sebagai folder yang terpisah-pisah.

## 1. Gambaran Keseluruhan

Sistem terdiri dari tiga bagian utama:

- `portal-frontend/`: aplikasi React yang menampilkan halaman portal publik dan halaman admin.
- `portal-api/`: backend CodeIgniter 4 yang menyajikan build React, menyediakan endpoint `/api/*`, memverifikasi login, dan menjadi proxy ke CKAN.
- `docker-ckan/`: stack CKAN sebagai katalog data utama, termasuk PostgreSQL, Solr, Redis, Datapusher, dan extension lokal.

Alur request paling umum:

```text
Browser
  -> Portal API / CodeIgniter
  -> React frontend
  -> Endpoint /api/*
  -> Controller CodeIgniter
  -> CKAN API
  -> PostgreSQL/Solr/DataStore CKAN
  -> Response JSON
  -> React render halaman
```

Pada production, browser membuka route portal seperti `/`, `/organisasi`, `/topik`, `/publikasi`, `/pencarian`, `/login`, atau `/admin`. Semua route halaman tersebut diarahkan oleh CodeIgniter ke `Frontend::index`, lalu `portal-api/public/frontend/index.html` dikirim sebagai shell aplikasi React.

## 2. Alur Frontend

Frontend utama berada di `portal-frontend/src`.

### 2.1 Routing Halaman

Routing halaman dikendalikan oleh `portal-frontend/src/App.jsx`.

Alurnya:

1. Browser membuka path, misalnya `/organisasi`.
2. `getInitialView()` membaca `window.location.pathname`.
3. React menentukan mode tampilan, misalnya `organisasi`, `publikasi`, `topik`, `search`, `login`, atau `admin`.
4. Komponen halaman yang sesuai dirender.
5. Navigasi internal memakai `window.history.pushState()` untuk sebagian halaman, sedangkan route tertentu seperti `/topik` diarahkan langsung memakai `window.location.href`.

Mapping utama:

| URL | View React | File utama |
| --- | --- | --- |
| `/` | Beranda | `Home.jsx` |
| `/organisasi` | Organisasi | `Organisasi.jsx` |
| `/publikasi` | Publikasi | `Publikasi.jsx` |
| `/topik` | Topik | `Topik.jsx` |
| `/pencarian` | Pencarian | `Search.jsx` |
| `/login` | Login | `Login.jsx` |
| `/admin` | Admin | `Admin.jsx` |

### 2.2 Alur Ambil Data

Frontend tidak langsung mengambil data ke CKAN. Frontend memanggil backend portal melalui helper di `portal-frontend/src/utils/ckan.js`.

Alur data:

```text
Komponen halaman React
  -> helper fetch di src/utils/ckan.js
  -> Axios ke backend portal
  -> endpoint /api/*
  -> response dibaca dari data.result
  -> state halaman diperbarui
  -> UI dirender
```

Helper penting:

| Helper frontend | Endpoint backend | Fungsi |
| --- | --- | --- |
| `fetchDatasets()` | `GET /api/datasets` atau `GET /api/search` | Mengambil dataset umum atau hasil pencarian |
| `fetchPublications()` | `GET /api/publications` | Mengambil dataset publikasi |
| `fetchTopics()` | `GET /api/topics` | Mengambil daftar CKAN groups untuk halaman topik |
| `fetchGroupDatasets(groupName)` | `GET /api/group-datasets?group=...` | Mengambil dataset dalam satu group/topik |
| `fetchOrganizations()` | `GET /api/organizations` | Mengambil daftar organisasi CKAN |
| `fetchDatasetById(id)` | `GET /api/dataset/:id` | Mengambil detail dataset |
| `fetchResourcePreview(resourceId)` | `GET /api/preview/:resourceId` | Mengambil preview isi resource |

### 2.3 Alur Halaman Beranda

Beranda menampilkan ringkasan portal dan navigasi awal.

Alur ringkas:

1. User membuka `/`.
2. Backend menyajikan shell React.
3. React merender `Home.jsx`.
4. Halaman mengambil data statistik dari endpoint backend yang relevan, misalnya dataset, organisasi, topik, publikasi, dan counter pengunjung.
5. User dapat berpindah ke organisasi, publikasi, topik, atau pencarian.

### 2.4 Alur Halaman Organisasi

Halaman organisasi menampilkan daftar organisasi dari CKAN.

Alur:

```text
Organisasi.jsx
  -> fetchOrganizations()
  -> GET /api/organizations
  -> Dataset::organizations()
  -> CKAN organization_list
  -> frontend menampilkan organisasi dan jumlah dataset
```

Jika user membuka detail dataset dari organisasi:

```text
Organisasi.jsx
  -> fetchDatasetById(datasetId)
  -> GET /api/dataset/:id
  -> CKAN package_show
  -> fetchResourcePreviewResult(resourceId)
  -> GET /api/preview/:resourceId
  -> CKAN datastore_search
  -> tabel, tombol download, dan grafik dirender
```

### 2.5 Alur Halaman Topik

Halaman topik memakai CKAN Groups sebagai sumber topik.

Alur:

```text
Topik.jsx
  -> fetchTopics()
  -> GET /api/topics
  -> Dataset::topics()
  -> CKAN group_list
  -> daftar topik ditampilkan
```

Ketika satu topik dipilih:

```text
Topik.jsx
  -> fetchGroupDatasets(groupName)
  -> GET /api/group-datasets?group=...
  -> Dataset::groupDatasets()
  -> CKAN package_search fq=groups:<group>
  -> daftar dataset topik ditampilkan
```

Detail dataset pada Topik mengikuti pola yang sama dengan Organisasi: ambil `package_show`, lalu ambil preview DataStore untuk tabel dan grafik.

### 2.6 Alur Halaman Publikasi

Halaman publikasi membaca dataset CKAN yang masuk ke group `publikasi`.

Alur:

```text
Publikasi.jsx
  -> fetchPublications()
  -> GET /api/publications
  -> Dataset::publications()
  -> CKAN package_search groups:publikasi
  -> fallback pencarian jika group kosong
  -> frontend menampilkan kartu/list publikasi
```

Backend juga melakukan enrich data organisasi dan menyimpan cache publikasi di `portal-api/writable/cache/publications-cache.json` jika data berhasil ditemukan.

### 2.7 Alur Pencarian

Alur pencarian:

```text
Search.jsx atau input pencarian
  -> query user
  -> fetchDatasets(query)
  -> GET /api/search?q=...
  -> Dataset::search()
  -> CKAN package_search q=<query>
  -> hasil ditampilkan
```

Jika query kosong, frontend memakai `GET /api/datasets`.

## 3. Alur Backend Portal

Backend portal berada di `portal-api/`.

### 3.1 Route Frontend

Route halaman didefinisikan di `portal-api/app/Config/Routes.php`.

Route berikut diarahkan ke `Frontend::index`:

```text
/
/organisasi
/publikasi
/topik
/pencarian
/open-data
/jadwal-rilis-dataset
/login
/admin
/dataset/:id
```

Controller `Frontend::index` membaca file:

```text
portal-api/public/frontend/index.html
```

Jika file build belum ada, backend menampilkan error yang meminta developer menjalankan:

```bash
cd portal-frontend
npm run build:portal
```

### 3.2 Route API

Route API utama:

| Endpoint | Controller | CKAN action utama |
| --- | --- | --- |
| `GET /api/datasets` | `Dataset::index` | `package_search?rows=1000` |
| `GET /api/dataset/:id` | `Dataset::show` | `package_show` |
| `GET /api/search?q=...` | `Dataset::search` | `package_search?q=...` |
| `GET /api/organizations` | `Dataset::organizations` | `organization_list` |
| `GET /api/topics` | `Dataset::topics` | `group_list` |
| `GET /api/group-datasets?group=...` | `Dataset::groupDatasets` | `package_search fq=groups:<group>` |
| `GET /api/publications` | `Dataset::publications` | `package_search fq=groups:publikasi` |
| `GET /api/preview/:resourceId` | `Dataset::preview` | `datastore_search` |
| `GET /api/visitors` | `Visitor::show` | SQLite lokal |
| `POST /api/visitors/increment` | `Visitor::increment` | SQLite lokal |
| `POST /api/login` | `Auth::login` | Login portal fallback |
| `POST /api/auth/ckan/sync` | `Auth::syncCkanSession` | Verifikasi session CKAN |

### 3.3 Proxy CKAN

Controller `Dataset.php` memakai base URL internal:

```text
http://ckan:5000/api/3/action
```

Semua request CKAN dipusatkan lewat helper `requestCkan($endpoint)`. Helper ini:

- membuat HTTP client CodeIgniter,
- mengirim GET request ke CKAN,
- decode JSON response,
- mengembalikan JSON error jika CKAN gagal diakses.

Backend sengaja menjadi perantara supaya frontend tidak perlu tahu detail host CKAN internal Docker dan supaya response bisa difilter atau diperkaya sebelum sampai ke browser.

### 3.4 Visitor Counter

Counter pengunjung berada di `Visitor.php` dan menyimpan data ke SQLite:

```text
portal-api/writable/analytics/visitors.sqlite3
```

Alur:

```text
Frontend
  -> POST /api/visitors/increment
  -> Visitor::increment()
  -> SQLite update total
  -> GET /api/visitors
  -> Visitor::show()
  -> total dikirim ke frontend
```

## 4. Alur Login dan Admin

Ada dua jalur login yang hidup di sistem.

### 4.1 Login Portal Fallback

Endpoint:

```text
POST /api/login
```

Controller:

```text
Auth::login()
```

Alur:

1. Frontend mengirim username dan password.
2. Backend memeriksa kredensial fallback `admin / 123456`.
3. Jika cocok, backend membuat JWT portal.
4. JWT dipakai untuk mengakses route admin portal yang dilindungi filter `jwt`.

### 4.2 Sinkronisasi Session CKAN

Endpoint:

```text
POST /api/auth/ckan/sync
```

Controller:

```text
Auth::syncCkanSession()
```

Alur:

```text
User login di CKAN
  -> browser punya cookie CKAN
  -> frontend memanggil /api/auth/ckan/sync
  -> backend meneruskan Cookie ke http://ckan:5000/dashboard
  -> jika dashboard valid, backend membaca identitas user dari HTML
  -> backend membuat JWT portal
  -> frontend menyimpan token untuk halaman admin portal
```

Jika CKAN redirect ke `/user/login`, session dianggap tidak valid.

### 4.3 Admin Dataset

Route admin portal:

```text
POST /api/admin/dataset
PUT /api/admin/dataset/:id
DELETE /api/admin/dataset/:id
```

Route tersebut dilindungi filter JWT. Setelah token valid, backend menjalankan operasi dataset sesuai controller yang tersedia.

## 5. Alur CKAN dan Extension

CKAN adalah sumber utama katalog dataset.

Service CKAN berjalan di Docker Compose dan dapat diakses dari host:

```text
http://localhost:5000
```

Dari dalam container backend, CKAN dipanggil melalui:

```text
http://ckan:5000
```

### 5.1 Data Catalog

CKAN menyimpan:

- dataset/package,
- resource/file,
- organisasi,
- group/topik,
- tag,
- user dan membership,
- status private/public,
- extras seperti `stats_workflow_status`.

### 5.2 DataStore dan Datapusher

Alur resource tabular:

```text
User upload resource di CKAN
  -> Datapusher/xloader membaca file
  -> DataStore CKAN menyimpan record tabular
  -> Portal memanggil /api/preview/:resourceId
  -> Backend memanggil datastore_search
  -> React menampilkan tabel dan grafik
```

Preview dibatasi 20 baris di backend agar response ringan.

### 5.3 Extension Restrict Visibility

Extension:

```text
docker-ckan/extensions/ckanext-restrict_visibility/
```

Tanggung jawab:

- membatasi pilihan visibility dataset,
- memaksa dataset non-admin menjadi private saat create,
- menolak update manual ke public jika user tidak berwenang,
- mengubah dropdown visibility di template CKAN,
- menambah patch xloader untuk file `.xls` yang sebenarnya berisi HTML table.

Alur visibility:

```text
User membuka form dataset CKAN
  -> template package_basic_fields.html membaca helper restrict_visibility_can_set_public
  -> jika user boleh, opsi Public muncul
  -> jika tidak, hanya Private muncul
  -> backend auth tetap memvalidasi saat package_create/package_update
```

### 5.4 Extension Stats Workflow

Extension:

```text
docker-ckan/extensions/ckanext-statsworkflow/
```

Tanggung jawab:

- menambahkan status workflow dataset,
- menambahkan role `Validator`, `Verifikator`, dan `Publikator`,
- menampilkan panel Workflow Publikasi di halaman detail dataset CKAN,
- menyediakan action transisi workflow,
- membuat role workflow readonly untuk edit dataset/resource biasa,
- menyembunyikan tombol edit resource untuk role workflow.

Status utama:

| Status | Arti |
| --- | --- |
| `draft` | Dataset baru atau draft editor |
| `waiting_validation` | Menunggu validasi |
| `revision_from_validator` | Dikembalikan validator |
| `waiting_verification` | Menunggu verifikasi |
| `revision_from_verificator` | Dikembalikan verifikator |
| `waiting_publish` | Menunggu publikator |
| `published` | Sudah public |

Alur transisi:

```text
Editor
  draft/revision -> Kirim ke Validator

Validator
  waiting_validation -> Minta Revisi
  waiting_validation -> Setujui Validasi

Verifikator
  waiting_verification -> Minta Revisi
  waiting_verification -> Setujui Verifikasi

Publikator
  waiting_publish -> Publish
  published -> Jadikan Private
```

Saat transisi workflow berjalan, extension mengubah dua hal:

- `stats_workflow_status` di extras dataset,
- `private` dataset.

Aturannya:

```text
status published => private false
status selain published => private true
```

## 6. Alur Role dan Permission CKAN

Role workflow dikelola dari halaman CKAN:

```text
Organisasi -> Members -> Add Member -> Role
```

Role tambahan:

- `Validator`
- `Verifikator`
- `Publikator`

Ketiga role tersebut readonly untuk edit dataset/resource biasa. Artinya mereka bisa melihat dataset internal organisasi, tetapi tidak bisa bebas mengedit dataset atau resource. Aksi yang boleh dilakukan tetap lewat tombol workflow sesuai role masing-masing.

Contoh kondisi tombol:

- Tombol **Publish** muncul untuk Publikator jika dataset berstatus `waiting_publish`.
- Tombol **Jadikan Private** muncul untuk Publikator jika dataset berstatus `published`.
- Tombol validator hanya muncul untuk Validator saat status `waiting_validation`.
- Tombol verifikator hanya muncul untuk Verifikator saat status `waiting_verification`.

Jika tombol tidak muncul, cek tiga hal:

1. User login CKAN benar.
2. User adalah member organisasi pemilik dataset dengan role yang sesuai.
3. Status workflow dataset sudah sesuai dengan tombol yang diharapkan.

## 7. Alur Infrastruktur Docker

Stack utama ada di:

```text
docker-ckan/compose/docker-compose.yml
```

Service utama:

| Service | Fungsi |
| --- | --- |
| `ckan` | Aplikasi CKAN |
| `ckan-worker-*` | Worker background job CKAN |
| `db` | PostgreSQL CKAN dan DataStore |
| `solr` | Search index CKAN |
| `redis` | Queue/cache CKAN |
| `datapusher` | Import resource ke DataStore |
| `portal-api` | Backend CodeIgniter |
| `portal-frontend` | Frontend development/container |

Extension CKAN dipasang saat container start melalui command service CKAN:

```text
uv pip install --system -e /app/extensions/ckanext-restrict_visibility -e /app/extensions/ckanext-statsworkflow
```

Folder extension dari host di-mount ke container:

```text
/root/baru/docker-ckan/extensions:/app/extensions
```

Karena itu perubahan file extension bisa terlihat di container, tetapi proses CKAN tetap perlu restart agar Python memuat kode baru.

## 8. Alur Debugging Cepat

### 8.1 Frontend Tidak Berubah

Cek:

- apakah sedang melihat build production atau dev server,
- apakah sudah menjalankan `npm run build:portal`,
- apakah file build masuk ke `portal-api/public/frontend`,
- apakah browser cache perlu hard refresh.

### 8.2 Endpoint API Kosong atau Error

Cek:

```bash
curl http://localhost:8081/api/datasets
curl http://localhost:8081/api/topics
curl http://localhost:8081/api/organizations
```

Lalu bandingkan dengan CKAN:

```bash
curl http://localhost:5000/api/3/action/status_show
curl "http://localhost:5000/api/3/action/package_search?rows=5"
curl "http://localhost:5000/api/3/action/group_list?all_fields=true"
```

### 8.3 Tombol Workflow Tidak Muncul

Cek:

- status dataset di CKAN extras `stats_workflow_status`,
- nilai `private`,
- organisasi pemilik dataset,
- membership user pada organisasi tersebut,
- apakah container CKAN sudah restart setelah perubahan plugin.

Perintah berguna:

```bash
cd docker-ckan/compose
docker compose ps
docker compose restart ckan
```

### 8.4 Perubahan Extension Belum Masuk

Cek file di container:

```bash
cd docker-ckan/compose
docker compose exec ckan sed -n '1,80p' /app/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py
```

Jika file sudah benar tetapi perilaku belum berubah, restart service CKAN:

```bash
docker compose restart ckan
```

## 9. Ringkasan File Kunci

| Area | File |
| --- | --- |
| Route frontend/backend | `portal-api/app/Config/Routes.php` |
| Penyaji build React | `portal-api/app/Controllers/Frontend.php` |
| Proxy dataset CKAN | `portal-api/app/Controllers/Dataset.php` |
| Login dan session CKAN | `portal-api/app/Controllers/Auth.php` |
| Counter visitor | `portal-api/app/Controllers/Visitor.php` |
| Routing React | `portal-frontend/src/App.jsx` |
| Helper API frontend | `portal-frontend/src/utils/ckan.js` |
| Halaman login | `portal-frontend/src/pages/Login.jsx` |
| Workflow CKAN | `docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py` |
| Visibility CKAN | `docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py` |
| Compose stack | `docker-ckan/compose/docker-compose.yml` |

