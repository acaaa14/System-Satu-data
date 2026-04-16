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

## Checklist Sebelum Presentasi

- Pastikan bisa menjelaskan peran React, Bootstrap, CodeIgniter 4, CKAN, PostgreSQL, dan Docker.
- Pastikan tahu file bukti utama:
  - `portal-frontend/package.json`
  - `portal-api/composer.json`
  - `portal-api/app/Config/Routes.php`
  - `portal-api/app/Controllers/Frontend.php`
  - `portal-api/app/Controllers/Dataset.php`
  - `docker-ckan/compose/docker-compose.yml`

