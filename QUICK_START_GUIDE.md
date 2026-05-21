# Quick Start Guide

Waktu baca: 5 menit

## Overview Singkat

Project ini adalah portal data Kota Tangerang dengan susunan:

- Frontend: React.js + Bootstrap
- Backend: CodeIgniter 4 + JWT
- Data platform: CKAN
- Database utama platform data: PostgreSQL
- Container orchestration: Docker Compose

Catatan penting:
- frontend production disajikan oleh CodeIgniter 4,
- backend CodeIgniter 4 juga menjadi proxy ke API CKAN,
- beberapa fitur seperti publikasi masih memakai local storage/frontend state.

## Dokumen yang Perlu Dibaca Dulu

### 1. `README.md`
Dipakai untuk:
- memahami struktur repo,
- melihat route utama,
- menjalankan project.

### 2. `DOKUMENTASI_INDEX.md`
Dipakai untuk:
- melihat peta dokumentasi,
- melihat bukti file untuk stack yang dipakai.

### 3. `ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md`
Dipakai untuk:
- menjelaskan arsitektur aktual,
- menunjukkan kesesuaian implementasi dengan stack yang diminta,
- melihat bukti implementasi di kode.

### 4. `DIAGRAM_ARSITEKTUR_VISUAL.md`
Dipakai untuk:
- menjelaskan arsitektur saat presentasi,
- menunjukkan alur request frontend ke backend ke CKAN.

### 5. `TODO.md`
Dipakai untuk:
- backlog pengembangan,
- pekerjaan teknis yang belum selesai.

## Cara Pakai Cepat

### Untuk onboarding teknis

1. Baca `README.md`
2. Lanjut ke `DOKUMENTASI_INDEX.md`
3. Lanjut ke `ANALISIS_SISTEM_ALIGNMENT_REQUIREMENT.md`
4. Jika butuh visual, buka `DIAGRAM_ARSITEKTUR_VISUAL.md`

### Untuk presentasi atau sidang

1. Mulai dari `EXECUTIVE_SUMMARY_PRESENTASI.md`
2. Pakai `DIAGRAM_ARSITEKTUR_VISUAL.md` untuk visual
3. Gunakan `INTERVIEW_TALKING_POINTS.md` untuk Q&A
4. Pakai `DOKUMENTASI_INDEX.md` dan `ANALISIS...` jika diminta bukti file

## Opening Statement Singkat

Kalimat aman yang sesuai implementasi sekarang:

> Sistem yang saya bangun adalah portal data Kota Tangerang berbasis CKAN. Antarmuka pengguna dibangun dengan React dan Bootstrap, lalu build frontend disajikan oleh CodeIgniter 4. Di sisi backend, CodeIgniter 4 juga menangani login berbasis JWT dan menjadi perantara untuk mengambil data dari API CKAN. Seluruh stack dijalankan dengan Docker Compose.

## Hal yang Perlu Diingat Saat Menjelaskan

- Jangan menyebut semua fitur sudah full production jika masih lokal, misalnya publikasi.
- Jangan menyebut React Router aktif sebagai routing utama, karena implementasi saat ini memakai path browser + state view.
- Jika ditanya bukti stack, arahkan ke `DOKUMENTASI_INDEX.md`.

## Quick Start Workflow CKAN

Workflow publikasi dataset berjalan di CKAN lewat extension:

```text
docker-ckan/extensions/ckanext-statsworkflow/
```

Langkah penggunaan cepat:

1. Login CKAN sebagai sysadmin atau admin organisasi.
2. Buka organisasi yang memiliki dataset.
3. Masuk ke **Members** -> **Add Member**.
4. Tambahkan user dengan role:
   - `Validator`
   - `Verifikator`
   - `Publikator`
5. Editor organisasi membuat atau memperbaiki dataset.
6. Buka halaman detail dataset CKAN.
7. Pakai panel **Workflow Publikasi**:
   - Editor: kirim ke validator.
   - Validator: minta revisi atau setujui validasi.
   - Verifikator: minta revisi atau setujui verifikasi.
   - Publikator: publish final.

Catatan penting:
- `Validator`, `Verifikator`, dan `Publikator` bersifat readonly.
- Mereka bisa melihat dataset/resource, tetapi tidak bisa edit dataset atau edit resource/file.
- Tombol **Edit resource** dan **Add new resource** disembunyikan dari role tersebut.
- Dataset hanya menjadi public saat status workflow `published`.

## Checklist Sebelum Presentasi

- Pastikan bisa menjelaskan peran React, Bootstrap, CodeIgniter 4, CKAN, PostgreSQL, dan Docker.
- Pastikan tahu file bukti utama:
  - `portal-frontend/package.json`
  - `portal-api/composer.json`
  - `portal-api/app/Config/Routes.php`
  - `portal-api/app/Controllers/Frontend.php`
  - `portal-api/app/Controllers/Dataset.php`
  - `docker-ckan/compose/docker-compose.yml`

## Quick Test API di Postman

Base URL portal:

```text
http://localhost:8081
```

Base URL CKAN:

```text
http://localhost:5000
```

### Endpoint Portal yang Perlu Dites

1. List semua dataset

   ```text
   GET http://localhost:8081/api/datasets
   ```

2. Detail dataset

   ```text
   GET http://localhost:8081/api/dataset/cakupan-penduduk-usia-lanjut-yang-mendapatkan-layanan-kesehatan
   ```

3. Search dataset

   ```text
   GET http://localhost:8081/api/search?q=kesehatan
   ```

4. List organisasi

   ```text
   GET http://localhost:8081/api/organizations
   ```

5. List topik dari CKAN Groups

   ```text
   GET http://localhost:8081/api/topics
   ```

6. Dataset berdasarkan topik/group

   ```text
   GET http://localhost:8081/api/group-datasets?group=sosial-dan-budaya
   ```

7. List publikasi

   ```text
   GET http://localhost:8081/api/publications
   ```

8. Preview DataStore/resource

   ```text
   GET http://localhost:8081/api/preview/003a71e0-098a-4d65-858e-a5ebfd5923cc
   ```

9. Jumlah visitor

   ```text
   GET http://localhost:8081/api/visitors
   ```

10. Tambah visitor

   ```text
   POST http://localhost:8081/api/visitors/increment
   ```

11. Login portal

   ```text
   POST http://localhost:8081/api/login
   ```

   Header:

   ```text
   Content-Type: application/json
   ```

   Body:

   ```json
   {
     "username": "admin",
     "password": "123456"
   }
   ```

### Endpoint CKAN yang Perlu Dites

1. Status CKAN

   ```text
   GET http://localhost:5000/api/3/action/status_show
   ```

2. List group CKAN

   ```text
   GET http://localhost:5000/api/3/action/group_list?all_fields=true&include_dataset_count=true
   ```

3. Detail group Sosial dan Budaya

   ```text
   GET http://localhost:5000/api/3/action/group_show?id=sosial-dan-budaya&include_datasets=true
   ```

4. Cari dataset dalam group

   ```text
   GET http://localhost:5000/api/3/action/package_search?fq=groups:sosial-dan-budaya
   ```

5. Detail dataset CKAN

   ```text
   GET http://localhost:5000/api/3/action/package_show?id=cakupan-penduduk-usia-lanjut-yang-mendapatkan-layanan-kesehatan
   ```

6. Preview DataStore langsung dari CKAN

   ```text
   GET http://localhost:5000/api/3/action/datastore_search?resource_id=003a71e0-098a-4d65-858e-a5ebfd5923cc&limit=20
   ```

## Quick Check Tampilan Data

Setelah data CKAN berhasil masuk:

1. Buka `http://localhost:8081/topik`.
2. Klik topik `Sosial dan Budaya`.
3. Klik dataset.
4. Pastikan tabel tampil dari DataStore.
5. Pastikan baris header palsu dari Excel tidak muncul sebagai data.
6. Pastikan angka tahun tampil seperti `77,720`, bukan `77720`.
7. Scroll ke grafik dan pastikan grafik mengikuti baris data pertama yang valid.
8. Ulangi pengecekan dari `http://localhost:8081/organisasi`.

Jika tampilan lama masih muncul, lakukan hard refresh browser dengan `Ctrl + F5`.
