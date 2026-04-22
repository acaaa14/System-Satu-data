# Pemetaan Frontend dan Backend

Dokumen ini dipakai untuk menandai bagian codebase yang termasuk frontend, backend, dan area pendukung lain supaya lebih mudah dibaca saat onboarding, debugging, atau menyusun logbook.

## 1. Frontend

Frontend utama berada di folder:

- `portal-frontend/`

Tanggung jawab frontend:

- menampilkan halaman publik portal,
- menampilkan halaman admin,
- memanggil API backend,
- merender data CKAN ke tampilan portal,
- mengelola interaksi user di browser.

Tampilan utama yang aktif di frontend saat ini mencakup:

- menu header: `Beranda`, `Organisasi`, `Publikasi`, `Topik`, `Peta`, `Login`,
- halaman beranda dengan ringkasan statistik: `Dataset`, `Organisasi`, `Topik`, `Publikasi`,
- halaman pencarian, login, dan admin.

### File dan Folder Penting Frontend

- `portal-frontend/src/pages/`
  Berisi halaman utama portal seperti:
  - `Home.jsx`
  - `HomeLogo.jsx`
  - `Organisasi.jsx`
  - `Topik.jsx`
  - `Publikasi.jsx`
  - `Search.jsx`
  - `Login.jsx`
  - `Admin.jsx`

- `portal-frontend/src/components/`
  Berisi komponen UI yang dipakai ulang, misalnya:
  - `Header.jsx`

- `portal-frontend/src/utils/`
  Berisi helper dan akses data, misalnya:
  - `ckan.js` untuk memanggil API backend
  - `ckanAuth.js` untuk URL login CKAN
  - `topics.js` untuk definisi topik tetap
  - `publications.js` untuk util publikasi lokal lama
  - `datasetVisibility.js` untuk state tampilan dataset admin

- `portal-frontend/src/styles/`
  Berisi styling halaman dan komponen frontend.

### Contoh File Frontend yang Sering Dipakai

- [portal-frontend/src/pages/Login.jsx](/root/baru/portal-frontend/src/pages/Login.jsx:1)
- [portal-frontend/src/pages/Admin.jsx](/root/baru/portal-frontend/src/pages/Admin.jsx:1)
- [portal-frontend/src/pages/Publikasi.jsx](/root/baru/portal-frontend/src/pages/Publikasi.jsx:1)
- [portal-frontend/src/pages/Topik.jsx](/root/baru/portal-frontend/src/pages/Topik.jsx:1)
- [portal-frontend/src/pages/Organisasi.jsx](/root/baru/portal-frontend/src/pages/Organisasi.jsx:1)
- [portal-frontend/src/components/Header.jsx](/root/baru/portal-frontend/src/components/Header.jsx:1)
- [portal-frontend/src/utils/ckan.js](/root/baru/portal-frontend/src/utils/ckan.js:1)

## 2. Backend

Backend utama berada di folder:

- `portal-api/`

Tanggung jawab backend:

- menyediakan endpoint API untuk frontend,
- mengambil data dari CKAN,
- memfilter dan merapikan response untuk frontend,
- memvalidasi session CKAN untuk login admin,
- menerbitkan JWT portal,
- menyajikan build frontend React di production.

### File dan Folder Penting Backend

- `portal-api/app/Controllers/`
  Berisi controller backend, misalnya:
  - `Dataset.php`
  - `Auth.php`
  - `Frontend.php`
  - `Visitor.php`

- `portal-api/app/Config/`
  Berisi konfigurasi route, filter, dan aplikasi, misalnya:
  - `Routes.php`

- `portal-api/public/frontend/`
  Berisi hasil build frontend React yang disajikan oleh backend CodeIgniter.

- `portal-api/writable/`
  Berisi file runtime backend, termasuk analytics SQLite untuk visitor counter.

### Contoh File Backend yang Sering Dipakai

- [portal-api/app/Controllers/Dataset.php](/root/baru/portal-api/app/Controllers/Dataset.php:1)
- [portal-api/app/Controllers/Auth.php](/root/baru/portal-api/app/Controllers/Auth.php:1)
- [portal-api/app/Controllers/Frontend.php](/root/baru/portal-api/app/Controllers/Frontend.php:1)
- [portal-api/app/Controllers/Visitor.php](/root/baru/portal-api/app/Controllers/Visitor.php:1)
- [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php:1)

## 3. Integrasi CKAN

Area integrasi CKAN tersebar di frontend dan backend:

- Frontend:
  - `portal-frontend/src/utils/ckan.js`
  - `portal-frontend/src/utils/ckanAuth.js`

- Backend:
  - `portal-api/app/Controllers/Dataset.php`
  - `portal-api/app/Controllers/Auth.php`

Peran masing-masing:

- frontend memanggil endpoint backend,
- backend yang berkomunikasi ke CKAN API,
- backend juga memverifikasi session login CKAN,
- frontend hanya merender hasil yang sudah dirapikan backend.

## 4. Infrastruktur dan Deployment

Bagian infrastruktur/container berada di folder:

- `docker-ckan/`

Tanggung jawab area ini:

- menjalankan CKAN,
- menjalankan PostgreSQL, Solr, Redis, Datapusher,
- menjalankan service portal API dan portal frontend dalam stack Docker.

### File Penting Infrastruktur

- [docker-ckan/compose/docker-compose.yml](/root/baru/docker-ckan/compose/docker-compose.yml:1)
- [docker-ckan/compose/config/ckan/.env](/root/baru/docker-ckan/compose/config/ckan/.env:1)

## 5. Ringkasan Cepat

Kalau ingin tahu lokasi kerja berdasarkan jenis tugas:

- Ubah tampilan halaman: cek `portal-frontend/src/pages/` atau `portal-frontend/src/styles/`
- Ubah komponen UI umum: cek `portal-frontend/src/components/`
- Ubah cara frontend ambil data: cek `portal-frontend/src/utils/`
- Ubah endpoint API: cek `portal-api/app/Controllers/` dan `portal-api/app/Config/Routes.php`
- Ubah login CKAN / JWT: cek `portal-api/app/Controllers/Auth.php` dan `portal-frontend/src/pages/Login.jsx`
- Ubah koneksi CKAN/infrastruktur: cek `docker-ckan/`

## 6. Catatan Praktis

- `portal-frontend/` adalah area utama untuk pekerjaan UI dan interaksi user.
- `portal-api/` adalah area utama untuk pekerjaan API, filter data, autentikasi, dan integrasi CKAN.
- `docker-ckan/` adalah area utama untuk konfigurasi service, environment, dan container stack.

Dokumen ini sengaja dibuat sebagai penanda cepat “bagian frontend mana dan backend mana”, bukan sebagai pengganti dokumentasi teknis detail lainnya.

## 7. Tugas yang Termasuk Frontend

Jenis tugas frontend biasanya meliputi:

- membuat atau mengubah tampilan halaman,
- mengatur layout, warna, font, tabel, tombol, dan hero section,
- menambahkan filter, pencarian, pagination, dan interaksi user,
- menghubungkan halaman ke endpoint backend,
- merapikan data hasil API sebelum ditampilkan ke user,
- membuat loading state, error state, dan empty state,
- mengatur navigasi dan redirect di browser,
- mengatur perilaku login dari sisi browser,
- menambahkan atau memperbaiki komponen reusable.

Contoh tugas frontend di project ini:

- halaman `Beranda` menampilkan statistik portal seperti jumlah dataset, organisasi, topik, dan publikasi,
- halaman `Publikasi` menampilkan dataset dari CKAN,
- halaman `Topik` merender 5 topik utama dan mengisi datanya dari CKAN,
- halaman `Organisasi` menyaring organisasi yang tidak perlu ditampilkan,
- tombol `Login` diarahkan langsung ke CKAN,
- halaman `Admin` mengecek token lalu redirect ke login CKAN bila belum login.

## 8. Tugas yang Termasuk Backend

Jenis tugas backend biasanya meliputi:

- membuat atau mengubah endpoint API,
- meneruskan request dari frontend ke CKAN,
- memfilter data sebelum dikirim ke frontend,
- menggabungkan atau memperkaya data CKAN agar frontend lebih mudah memakai response,
- memvalidasi session login CKAN,
- membuat token JWT internal portal,
- mengatur route backend,
- menangani error API dan format response JSON,
- menyajikan hasil build frontend React di production.

Contoh tugas backend di project ini:

- endpoint `GET /api/publications` mengambil data publikasi dari CKAN,
- endpoint `GET /api/topics` mengambil data topik dari CKAN,
- endpoint `GET /api/organizations` memfilter organisasi tertentu,
- endpoint `POST /api/auth/ckan/sync` memverifikasi session CKAN,
- backend memperkaya data organisasi agar logo/gambar dari CKAN bisa dipakai frontend.

## 9. Tugas yang Termasuk Infrastruktur

Jenis tugas infrastruktur biasanya meliputi:

- mengatur `.env` CKAN,
- mengatur service di `docker-compose`,
- menyalakan atau mematikan container,
- mengatur koneksi antar service,
- mengatur environment development dan production.

Contoh tugas infrastruktur di project ini:

- mengubah konfigurasi CKAN di `docker-ckan/compose/config/ckan/.env`,
- mengubah susunan service di `docker-ckan/compose/docker-compose.yml`.
