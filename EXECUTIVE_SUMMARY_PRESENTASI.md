# Executive Summary Presentasi

## Ringkasan Sistem

Portal ini adalah portal data Kota Tangerang yang memakai:

- React.js untuk antarmuka pengguna
- Bootstrap untuk warna, tombol, dan tata letak
- CodeIgniter 4 untuk backend, JWT, dan penyaji frontend build
- CKAN sebagai data platform
- PostgreSQL sebagai database utama platform data
- Docker Compose sebagai orkestrasi container

## Narasi Presentasi 3-5 Menit

### 1. Pembukaan

> Sistem yang saya bangun adalah portal data Kota Tangerang berbasis CKAN. Frontend dibangun dengan React.js dan Bootstrap, lalu hasil build frontend disajikan ke browser oleh CodeIgniter 4. Selain itu, CodeIgniter 4 juga menyediakan endpoint backend dan autentikasi JWT untuk kebutuhan integrasi ke CKAN.

### 2. Arsitektur Singkat

> Alur sistemnya sederhana. User membuka website, CodeIgniter 4 mengirim shell frontend React, lalu React mengambil data ke backend `/api`. Backend ini kemudian mengambil data yang dibutuhkan dari CKAN, misalnya dataset, organisasi, pencarian, dan preview resource.

### 3. Fitur Utama Saat Ini

- Home dengan statistik portal
- Halaman organisasi
- Halaman topik
- Halaman publikasi
- Halaman pencarian
- Login admin
- Counter pengunjung sederhana

### 4. Catatan Implementasi Nyata

- Dataset, organisasi, pencarian, dan preview sudah terhubung ke backend/CKAN.
- Publikasi masih dikelola dari frontend/local storage.
- Frontend production dilayani oleh CodeIgniter 4, bukan Node.js runtime.

### 5. Nilai Arsitektur

> Arsitektur ini memisahkan peran dengan cukup jelas. React fokus ke tampilan dan interaksi, CodeIgniter 4 fokus ke backend serta hosting frontend build, sedangkan CKAN tetap menjadi sumber data utama. Ini memudahkan pemeliharaan dan pengembangan bertahap.

## Compliance Ringkas

| Komponen | Status | Bukti Utama |
| --- | --- | --- |
| React.js | Sesuai | `portal-frontend/package.json` |
| Bootstrap | Sesuai | `portal-frontend/package.json` |
| CodeIgniter 4 | Sesuai | `portal-api/composer.json` |
| JWT | Sesuai | `portal-api/composer.json`, `Routes.php` |
| CKAN | Sesuai | `Dataset.php`, `docker-ckan` |
| PostgreSQL | Sesuai | stack `docker-ckan` |
| Docker | Sesuai | `docker-ckan/compose/docker-compose.yml` |

## Slide Outline Singkat

### Slide 1
Judul project dan tujuan portal.

### Slide 2
Stack utama:
- React.js
- Bootstrap
- CodeIgniter 4
- CKAN
- PostgreSQL
- Docker

### Slide 3
Diagram alur:
Browser -> CodeIgniter 4 -> CKAN -> PostgreSQL/support services

### Slide 4
Fitur utama yang sudah aktif.

### Slide 5
Bukti file implementasi dan kesimpulan.

## Penutup

> Kesimpulannya, sistem ini sudah menunjukkan integrasi nyata antara React, CodeIgniter 4, CKAN, PostgreSQL, dan Docker. Implementasi intinya sudah berjalan, dan area yang masih perlu dimatangkan terutama ada pada konsolidasi dokumentasi, routing frontend, dan sumber data publikasi.

