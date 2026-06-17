# Dokumentasi Index

Dokumen-dokumen di root repo ini dipakai sebagai panduan cepat untuk memahami kondisi sistem saat ini.

## Daftar Dokumen

### `README.md`
Dokumen entry point project:
- gambaran sistem
- struktur repo
- route utama
- cara menjalankan project

### `ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md`
Dokumen analisis implementasi aktual:
- komponen sistem yang benar-benar ada di repo
- alur data frontend ke backend ke CKAN
- checklist kesesuaian implementasi

### `DIAGRAM_ARSITEKTUR_VISUAL.md`
Diagram ASCII ringkas untuk:
- arsitektur sistem
- alur request
- relasi service

### `TODO.md`
Daftar backlog teknis yang masih relevan dengan kondisi codebase sekarang.

### `PEMETAAN_FRONTEND_BACKEND.md`
Peta area frontend, backend, infrastruktur, dan CKAN extension. Dokumen ini juga mencatat tahapan teknis workflow CKAN, termasuk:
- role `Validator`, `Verifikator`, dan `Publikator` di menu Members organisasi,
- permission readonly untuk role workflow,
- penyembunyian tombol edit resource,
- file plugin/template yang terlibat.

### `ALUR_SISTEM.md`
Dokumen alur sistem end-to-end:
- alur keseluruhan dari browser sampai CKAN,
- alur per bagian frontend,
- alur per endpoint backend,
- alur login, workflow CKAN, role, dan debugging cepat.

## Cara Pakai

- Untuk onboarding cepat: baca `README.md`, `ALUR_SISTEM.md`, lalu `DIAGRAM_ARSITEKTUR_VISUAL.md`.
- Untuk audit fitur: baca `ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md`.
- Untuk next step pengembangan: buka `TODO.md`.
- Untuk memahami perubahan workflow CKAN: buka `PEMETAAN_FRONTEND_BACKEND.md` bagian workflow.

## Catatan

Beberapa dokumen lama di repo ini masih berorientasi presentasi/interview. Dokumen tersebut bisa tetap dipakai sebagai materi pendukung, tetapi acuan teknis paling akurat untuk codebase saat ini adalah empat file di atas.

## Catatan Tambahan Pekerjaan Terbaru

Pekerjaan terbaru yang sudah dicatat di dokumentasi:

- perbaikan DataPusher/DataStore CKAN karena token API DataPusher tidak valid,
- penyesuaian port DataPusher menjadi `8000:8000`,
- integrasi halaman Topik portal dengan CKAN Groups,
- penambahan endpoint `/api/group-datasets`,
- detail dataset Topik dibuat seperti detail dataset Organisasi,
- tabel dan grafik Topik/Organisasi membaca kolom `Tahun 2015` sampai `Tahun 2025`,
- angka tahun diformat seperti contoh Excel, misalnya `77720` menjadi `77,720`,
- baris header palsu dari Excel tidak lagi ditampilkan sebagai data,
- list endpoint yang perlu dites di Postman,
- penjelasan `visitor` sebagai counter kunjungan portal.

Dokumen yang paling relevan untuk pekerjaan terbaru:

- `LOGBOOK_PENGERJAAN.md`: catatan kronologis dan bukti file.
- `PEMETAAN_FRONTEND_BACKEND.md`: peta bagian frontend/backend yang berubah.
- `QUICK_START_GUIDE.md`: cara tes cepat endpoint API.
- `README.md`: ringkasan fitur dan route terbaru.

## Bukti Implementasi di Kode

Pernyataan stack berikut sudah punya bukti langsung di codebase:

- `Frontend: React.js + CodeIgniter 4 + Bootstrap`
  Bukti React dan Bootstrap ada di [portal-frontend/package.json](/root/baru/portal-frontend/package.json:13) pada dependency `react`, `react-dom`, dan `bootstrap`.
  Bukti CodeIgniter 4 menjadi host/renderer frontend ada di [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php:8) dan [portal-api/app/Controllers/Frontend.php](/root/baru/portal-api/app/Controllers/Frontend.php:10), karena route frontend diarahkan ke `Frontend::index` yang mengirim `public/frontend/index.html`.

- `Backend: CodeIgniter 4 (JWT) untuk mengambil API dari CKAN`
  Bukti CodeIgniter 4 dan JWT ada di [portal-api/composer.json](/root/baru/portal-api/composer.json:12) pada dependency `codeigniter4/framework` dan `firebase/php-jwt`.
  Bukti backend mengambil data dari CKAN ada di [portal-api/app/Controllers/Dataset.php](/root/baru/portal-api/app/Controllers/Dataset.php:10), terutama `private $ckan = "http://ckan:5000/api/3/action";` dan helper `requestCkan()`.
  Bukti route API backend ada di [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php:25).

- `Login admin langsung ke CKAN`
  Bukti frontend mengarahkan login ke CKAN ada di [portal-frontend/src/components/Header.jsx](/root/baru/portal-frontend/src/components/Header.jsx:2) dan [portal-frontend/src/pages/Admin.jsx](/root/baru/portal-frontend/src/pages/Admin.jsx:3), karena keduanya memakai `CKAN_LOGIN_URL`.
  Bukti sinkronisasi session CKAN ke token portal ada di [portal-frontend/src/pages/Login.jsx](/root/baru/portal-frontend/src/pages/Login.jsx:7) dan [portal-api/app/Controllers/Auth.php](/root/baru/portal-api/app/Controllers/Auth.php:96).

- `Publikasi diambil dari CKAN`
  Bukti endpoint publikasi ada di [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php:25) pada route `GET /api/publications`.
  Bukti implementasi backend ada di [portal-api/app/Controllers/Dataset.php](/root/baru/portal-api/app/Controllers/Dataset.php:145).
  Bukti halaman frontend membaca dari backend ada di [portal-frontend/src/pages/Publikasi.jsx](/root/baru/portal-frontend/src/pages/Publikasi.jsx:3).

- `Topik tetap 5 kategori utama, tetapi isinya dari CKAN`
  Bukti definisi lima topik ada di [portal-frontend/src/utils/topics.js](/root/baru/portal-frontend/src/utils/topics.js:7).
  Bukti halaman `Topik` mengambil data dari CKAN lalu memasangkannya ke definisi itu ada di [portal-frontend/src/pages/Topik.jsx](/root/baru/portal-frontend/src/pages/Topik.jsx:2).

- `Data Platform: CKAN`
  Bukti service CKAN ada di [docker-ckan/compose/services/ckan/ckan.yaml](/root/baru/docker-ckan/compose/services/ckan/ckan.yaml:3), dengan image `ghcr.io/keitaroinc/ckan:${CKAN_VERSION}`.

- `Workflow publikasi CKAN`
  Bukti extension workflow ada di [docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:1).
  Bukti template panel workflow ada di [docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/workflow_actions.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/workflow_actions.html:1).
  Bukti tombol edit resource disembunyikan untuk role readonly ada di [docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/resource_read.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/resource_read.html:1).

- `Database: PostgreSQL`
  Bukti PostgreSQL dipakai dalam stack container ada di [docker-ckan/compose/docker-compose.yml](/root/baru/docker-ckan/compose/docker-compose.yml:25), karena file compose utama meng-include service database.

- `Container: Docker`
  Bukti orkestrasi container ada di [docker-ckan/compose/docker-compose.yml](/root/baru/docker-ckan/compose/docker-compose.yml:1), yang menggabungkan service CKAN, worker, db, solr, redis, datapusher, portal-api, dan portal-frontend.

- `Bootstrap mengatur warna, tombol, dan tata letak`
  Bukti dependency Bootstrap ada di [portal-frontend/package.json](/root/baru/portal-frontend/package.json:16).
  Bukti penggunaan Bootstrap di view lama/referensi backend ada di [portal-api/app/Views/home.php](/root/baru/portal-api/app/Views/home.php:12), yaitu import CDN Bootstrap dan class seperti `btn`, `card`, `row`, `col-lg-7`.

- `CodeIgniter 4 menampilkan halaman HTML ke browser`
  Bukti paling langsung ada di [portal-api/app/Controllers/Frontend.php](/root/baru/portal-api/app/Controllers/Frontend.php:22), karena controller mengembalikan response HTML dengan `setContentType('text/html')` dan `setBody(...)`.

- `Topik membaca CKAN Groups`
  Bukti route group dataset ada di [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php:29).
  Bukti backend membaca CKAN groups ada di [portal-api/app/Controllers/Dataset.php](/root/baru/portal-api/app/Controllers/Dataset.php:369).
  Bukti frontend membuka dataset berdasarkan group ada di [portal-frontend/src/pages/Topik.jsx](/root/baru/portal-frontend/src/pages/Topik.jsx:260).

- `Detail dataset Topik dan Organisasi memakai DataStore dan grafik`
  Bukti detail Topik ada di [portal-frontend/src/pages/Topik.jsx](/root/baru/portal-frontend/src/pages/Topik.jsx:414).
  Bukti detail Organisasi ada di [portal-frontend/src/pages/Organisasi.jsx](/root/baru/portal-frontend/src/pages/Organisasi.jsx:335).
  Bukti komponen grafik ada di [portal-frontend/src/components/DatasetLineChart.jsx](/root/baru/portal-frontend/src/components/DatasetLineChart.jsx:1).

- `DataPusher sudah dikonfigurasi ulang`
  Bukti token DataPusher ada di [docker-ckan/compose/config/ckan/.env](/root/baru/docker-ckan/compose/config/ckan/.env:33).
  Bukti port DataPusher ada di [docker-ckan/compose/services/datapusher/datapusher.yaml](/root/baru/docker-ckan/compose/services/datapusher/datapusher.yaml:6).
