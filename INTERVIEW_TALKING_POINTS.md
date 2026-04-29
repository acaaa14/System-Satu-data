# Interview Talking Points

## Opening Statement

### Versi singkat

> Sistem yang saya bangun adalah portal data Kota Tangerang berbasis CKAN. Frontend-nya menggunakan React.js dan Bootstrap, lalu build frontend disajikan ke browser oleh CodeIgniter 4. Di sisi backend, CodeIgniter 4 juga menangani autentikasi JWT dan menjadi proxy untuk mengambil data dari API CKAN. Infrastruktur utama dijalankan melalui Docker Compose dengan CKAN, PostgreSQL, Solr, Redis, dan Datapusher.

### Versi menengah

> Sistem ini terdiri dari tiga bagian utama. Pertama, frontend React yang menangani tampilan halaman seperti home, organisasi, topik, publikasi, pencarian, login, dan admin. Kedua, backend CodeIgniter 4 yang menyajikan build frontend ke browser, menyediakan endpoint API, login JWT, dan integrasi ke CKAN. Ketiga, platform data CKAN yang berjalan bersama PostgreSQL dan service pendukung lain di Docker Compose.

## Pertanyaan Umum

### 1. Kenapa React dan CodeIgniter 4 dipakai bersamaan?

Jawaban singkat:

> React dipakai untuk pengalaman UI yang lebih interaktif, sedangkan CodeIgniter 4 dipakai untuk routing backend, autentikasi JWT, dan integrasi dengan CKAN. Selain itu, CodeIgniter 4 juga menyajikan build frontend production ke browser.

### 2. Kenapa tidak langsung memanggil CKAN dari React?

Jawaban singkat:

> Karena backend CodeIgniter 4 dipakai sebagai lapisan perantara. Ini membantu untuk menyatukan format response, menangani error, mengontrol endpoint yang boleh diakses frontend, dan menempatkan autentikasi JWT di sisi backend.

### 3. Apa bukti CodeIgniter 4 menjadi renderer frontend?

Jawaban singkat:

> Route frontend diarahkan ke `Frontend::index`, lalu controller itu mengirim file `public/frontend/index.html` ke browser. Bukti filenya ada di `portal-api/app/Config/Routes.php` dan `portal-api/app/Controllers/Frontend.php`.

### 4. JWT dipakai di mana?

Jawaban singkat:

> JWT dipakai untuk endpoint admin. Dependency-nya ada di `portal-api/composer.json`, route login ada di `POST /api/login`, dan route admin dataset diproteksi filter JWT di `Routes.php`.

### 5. CKAN berperan sebagai apa?

Jawaban singkat:

> CKAN adalah data platform utama yang menyimpan dan menyediakan katalog dataset. Backend mengambil data dataset, organisasi, pencarian, dan preview dari CKAN melalui controller `Dataset.php`.

### 6. PostgreSQL dipakai untuk apa?

Jawaban singkat:

> PostgreSQL dipakai sebagai database utama untuk stack CKAN. Dalam arsitektur ini PostgreSQL mendukung penyimpanan metadata dan layanan platform data.

### 7. Apakah semua fitur sudah sepenuhnya backend-driven?

Jawaban yang jujur:

> Belum semuanya. Dataset, organisasi, pencarian, dan preview sudah mengambil data dari backend/CKAN. Tetapi fitur publikasi saat ini masih memakai local storage di frontend, jadi itu salah satu area pengembangan berikutnya.

### 8. Bagaimana routing frontend saat ini?

Jawaban yang jujur:

> Frontend saat ini memakai pembacaan path browser dan state view di `src/App.jsx`. Dependency `react-router-dom` masih ada, tetapi routing aktif utama belum memakai `<Routes>`.

### 9. Apa kekuatan arsitektur project ini?

Jawaban singkat:

> Kekuatan utamanya adalah pemisahan peran yang jelas: React untuk UI, CodeIgniter 4 untuk host frontend dan API, CKAN untuk katalog data, serta Docker untuk konsistensi lingkungan.

### 10. Apa area yang masih perlu ditingkatkan?

Jawaban singkat:

> Sinkronisasi dokumentasi, konsolidasi routing frontend, penguatan validasi admin, dan memindahkan publikasi dari local storage ke backend atau sumber data yang lebih stabil.

### 11. Bagaimana cara membatasi pilihan Public dan Private di CKAN?

Jawaban singkat:

> Saya tidak mengubah file core CKAN seperti `create.py` atau `update.py`. Saya membuat extension CKAN lokal bernama `ckanext-restrict_visibility`. Extension ini membatasi visibility dataset agar `Public` hanya bisa dipilih oleh sysadmin dan admin organisasi, sedangkan editor hanya bisa memilih `Private`.

### 12. Apakah plugin visibility itu didownload?

Jawaban singkat:

> Tidak. Plugin atau extension tersebut dibuat sendiri di project lokal, tepatnya di folder `docker-ckan/extensions/ckanext-restrict_visibility`. Extension ini di-mount ke container Docker, lalu diinstall saat CKAN start menggunakan `uv pip install --system -e /app/extensions/ckanext-restrict_visibility`.

### 13. Bagian CKAN mana yang diubah untuk menyembunyikan Public dari editor?

Jawaban singkat:

> Yang diubah adalah template dropdown Visibility melalui extension, bukan template core CKAN secara langsung. Template asli CKAN tetap dipakai, lalu bagian block `package_metadata_fields_visibility` dioverride agar editor hanya melihat `Private`. Untuk sysadmin dan admin organisasi, opsi `Public` tetap ditampilkan.

### 14. Kenapa validasi visibility juga dibuat di backend?

Jawaban singkat:

> Karena menyembunyikan `Public` di tampilan saja belum cukup aman. Editor masih bisa mencoba mengirim request manual lewat API atau browser developer tools. Karena itu extension juga memakai `IAuthFunctions` untuk memaksa dataset editor menjadi `Private` dan menolak update ke `Public`.

## Bukti File yang Bisa Disebut Saat Ditanya

- React dan Bootstrap: `portal-frontend/package.json`
- CodeIgniter 4 dan JWT: `portal-api/composer.json`
- Renderer frontend: `portal-api/app/Config/Routes.php`, `portal-api/app/Controllers/Frontend.php`
- CKAN proxy: `portal-api/app/Controllers/Dataset.php`
- Extension pembatasan visibility: `docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py`
- Template visibility CKAN: `docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/templates/package/snippets/package_basic_fields.html`
- Aktivasi plugin CKAN: `docker-ckan/compose/config/ckan/.env`
- Docker Compose stack: `docker-ckan/compose/docker-compose.yml`

## Closing Statement

> Secara implementasi, sistem ini sudah menunjukkan integrasi nyata antara React, CodeIgniter 4, CKAN, PostgreSQL, dan Docker. Beberapa area masih bisa dimatangkan, tetapi arsitektur inti dan alur data utamanya sudah berjalan.
