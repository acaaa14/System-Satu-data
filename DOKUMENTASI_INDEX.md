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

## Cara Pakai

- Untuk onboarding cepat: baca `README.md` lalu `DIAGRAM_ARSITEKTUR_VISUAL.md`.
- Untuk audit fitur: baca `ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md`.
- Untuk next step pengembangan: buka `TODO.md`.

## Catatan

Beberapa dokumen lama di repo ini masih berorientasi presentasi/interview. Dokumen tersebut bisa tetap dipakai sebagai materi pendukung, tetapi acuan teknis paling akurat untuk codebase saat ini adalah empat file di atas.

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

- `Database: PostgreSQL`
  Bukti PostgreSQL dipakai dalam stack container ada di [docker-ckan/compose/docker-compose.yml](/root/baru/docker-ckan/compose/docker-compose.yml:25), karena file compose utama meng-include service database.

- `Container: Docker`
  Bukti orkestrasi container ada di [docker-ckan/compose/docker-compose.yml](/root/baru/docker-ckan/compose/docker-compose.yml:1), yang menggabungkan service CKAN, worker, db, solr, redis, datapusher, portal-api, dan portal-frontend.

- `Bootstrap mengatur warna, tombol, dan tata letak`
  Bukti dependency Bootstrap ada di [portal-frontend/package.json](/root/baru/portal-frontend/package.json:16).
  Bukti penggunaan Bootstrap di view lama/referensi backend ada di [portal-api/app/Views/home.php](/root/baru/portal-api/app/Views/home.php:12), yaitu import CDN Bootstrap dan class seperti `btn`, `card`, `row`, `col-lg-7`.

- `CodeIgniter 4 menampilkan halaman HTML ke browser`
  Bukti paling langsung ada di [portal-api/app/Controllers/Frontend.php](/root/baru/portal-api/app/Controllers/Frontend.php:22), karena controller mengembalikan response HTML dengan `setContentType('text/html')` dan `setBody(...)`.
