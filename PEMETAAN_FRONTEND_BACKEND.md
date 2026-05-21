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

## 10. Langkah Pengerjaan Tombol Workflow CKAN

Bagian ini menjelaskan alur pekerjaan dari kondisi awal sebelum ada tombol sampai tombol workflow muncul di halaman detail dataset CKAN.

### Kondisi Awal Sebelum Ada Tombol

Sebelum tombol dibuat, extension `ckanext-statsworkflow` sebenarnya sudah punya logic workflow di backend CKAN. Status dataset sudah disimpan di extras dengan key:

```text
stats_workflow_status
```

Action backend juga sudah tersedia, misalnya:

- `statsworkflow_submit_validation`
- `statsworkflow_validator_revision`
- `statsworkflow_validator_approve`
- `statsworkflow_verificator_revision`
- `statsworkflow_verificator_approve`
- `statsworkflow_publish`

Masalahnya, user biasa belum punya tombol di halaman CKAN untuk menjalankan action tersebut. Akibatnya perubahan status hanya praktis dilakukan lewat API atau `curl`.

Field `stats_workflow_status` memang terlihat di Custom Field CKAN, tetapi tidak boleh diganti manual. Plugin sengaja memblok perubahan manual supaya user tidak bisa melompati alur, misalnya dari `draft` langsung ke `published`.

### Kenapa Perlu Tombol

Tombol dibuat supaya validator, verifikator, publikator, dan editor bisa menjalankan workflow dari UI CKAN tanpa menulis request API manual.

Tombol tetap aman karena tidak mengubah `stats_workflow_status` langsung dari form. Tombol hanya mengirim POST ke endpoint extension, lalu endpoint tersebut memanggil action workflow CKAN yang sudah punya validasi role dan validasi status.

Dengan begitu:

- editor hanya melihat aksi yang boleh dilakukan editor,
- validator hanya melihat aksi validasi saat status `waiting_validation`,
- verifikator hanya melihat aksi verifikasi saat status `waiting_verification`,
- publikator hanya melihat aksi publish saat status `waiting_publish`,
- alur status tetap tidak bisa dilompati manual.

### Langkah Teknis yang Dikerjakan

1. Mengecek workflow backend yang sudah ada di `ckanext-statsworkflow`.

   File utama:

   - [plugin.py](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:1)

   Di file ini sudah ada daftar status seperti `draft`, `waiting_validation`, `revision_from_validator`, `waiting_verification`, `revision_from_verificator`, `waiting_publish`, dan `published`.

2. Memastikan perubahan status tidak boleh lewat Custom Field manual.

   Plugin sudah memblok perubahan status biasa melalui `package_update`. Perubahan hanya boleh terjadi jika context memiliki flag `statsworkflow_transition`, yaitu flag yang dipakai oleh action workflow internal.

3. Membuat mapping tombol ke action workflow.

   Mapping tombol dibuat di:

   - [WORKFLOW_ACTIONS](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:54)

   Mapping ini menentukan:

   - slug URL tombol,
   - action CKAN yang dipanggil,
   - label tombol,
   - class tampilan tombol,
   - status sumber yang boleh menampilkan tombol.

4. Membuat helper untuk menentukan tombol yang boleh muncul.

   Helper dibuat di:

   - [workflow_buttons](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:457)

   Helper ini membaca status dataset dan mengecek permission user memakai `check_access`. Jika user tidak punya role yang cocok, tombol tidak ditampilkan.

5. Membuat endpoint POST untuk klik tombol.

   Endpoint handler dibuat di:

   - [workflow_transition](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:482)

   Fungsi ini menerima klik tombol, mencari action workflow yang sesuai, menjalankan `tk.get_action(...)`, lalu redirect kembali ke halaman dataset dengan pesan sukses atau error.

6. Mendaftarkan route tombol memakai `IBlueprint`.

   Route didaftarkan di:

   - [get_blueprint](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:613)

   Route yang dibuat:

   ```text
   POST /statsworkflow/<action_slug>/<id>
   ```

7. Membuat template panel workflow di halaman dataset CKAN.

   Template panel dibuat di:

   - [workflow_actions.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/workflow_actions.html:1)

   Template ini menampilkan:

   - judul **Workflow Publikasi**,
   - status workflow saat ini,
   - tombol yang dikembalikan helper `h.statsworkflow_buttons(pkg)`.

8. Memasukkan panel workflow ke halaman detail dataset.

   Override template dibuat di:

   - [read.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/read.html:1)

   File ini memperluas halaman detail dataset CKAN dan menambahkan snippet workflow setelah deskripsi dataset.

9. Mendaftarkan template baru ke package extension.

   File yang diupdate:

   - [setup.py](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/setup.py:9)

   Tujuannya agar file template baru ikut dikenali ketika extension diinstall di container CKAN.

10. Restart container CKAN.

    Setelah route dan template baru ditambahkan, container CKAN perlu direstart agar `IBlueprint` dan template override baru dibaca ulang.

    Container yang direstart:

    ```text
    ckan-ckan-1
    ```

### Alur Tombol Setelah Jadi

Setelah implementasi selesai, halaman detail dataset CKAN menampilkan panel **Workflow Publikasi**.

Alur tombolnya:

- `draft` -> editor melihat **Kirim ke Validator**.
- `waiting_validation` -> validator melihat **Minta Revisi** dan **Setujui Validasi**.
- `revision_from_validator` -> editor bisa memperbaiki dataset lalu kirim ulang ke validator.
- `waiting_verification` -> verifikator melihat **Minta Revisi** dan **Setujui Verifikasi**.
- `revision_from_verificator` -> editor bisa memperbaiki dataset lalu kirim ulang ke validator.
- `waiting_publish` -> publikator melihat **Publish**.
- `published` -> dataset menjadi public.

### Kenapa Tombol Bisa Muncul

Tombol bisa muncul karena CKAN mendukung override template dan route dari extension.

Di sisi tampilan, extension menambahkan folder `templates` ke CKAN melalui `tk.add_template_directory`. Setelah itu file `templates/package/read.html` bisa memperluas halaman detail dataset bawaan CKAN.

Di sisi backend, extension memakai `IBlueprint` untuk menambahkan route POST sendiri. Route inilah yang menerima klik tombol dari browser.

Di sisi permission, helper `workflow_buttons()` mengecek action yang boleh dipakai user. Jadi tombol bukan hanya elemen HTML, tetapi hasil dari kombinasi:

- status dataset saat ini,
- role user saat ini,
- action workflow yang diizinkan,
- template CKAN yang dirender ulang.

### Verifikasi yang Dilakukan

Verifikasi setelah implementasi:

- syntax Python plugin dicek dengan `python3 -m py_compile`,
- syntax plugin di dalam container CKAN dicek dengan `docker exec ckan-ckan-1 python -m py_compile ...`,
- container CKAN direstart,
- halaman dataset CKAN dites dan berhasil merender panel **Workflow Publikasi** dengan HTTP 200.

## 11. Tahapan Perbaikan Role Workflow dan Tombol Edit Resource

Bagian ini mencatat perbaikan lanjutan pada workflow CKAN: role `Validator`, `Verifikator`, dan `Publikator` dipindahkan ke menu **Members** organisasi, dibuat readonly, dan tombol edit resource disembunyikan dari UI.

### Tujuan Perbaikan

Perbaikan ini dibuat supaya admin organisasi tidak perlu mengisi role workflow lewat `.env`. Admin cukup membuka halaman organisasi CKAN, masuk ke tab **Members**, lalu menambahkan user dengan role:

- `Validator`
- `Verifikator`
- `Publikator`

Ketiga role tersebut hanya boleh melihat dataset/resource dan menjalankan aksi workflow sesuai tahapnya. Mereka tidak boleh:

- mengedit dataset,
- mengedit resource/file,
- menambah resource,
- menghapus dataset/resource,
- mengelola member organisasi.

### Tahapan Implementasi

1. Menambahkan daftar role workflow.

   Kode berada di:

   - [plugin.py](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py)

Bagian `WORKFLOW_ROLES` mendefinisikan role tambahan:

   ```python
   WORKFLOW_ROLES = {
       'validator': _('Validator'),
       'verificator': _('Verifikator'),
       'publikator': _('Publikator'),
   }
   ```

   Catatan:
   - key kiri adalah nilai role yang disimpan CKAN di `member.capacity`,
   - label kanan adalah teks yang muncul di dropdown **Role**.

2. Mendaftarkan role ke permission CKAN.

   Fungsi `_install_workflow_roles()` mengisi `authz.ROLE_PERMISSIONS`.

   ```python
   authz.ROLE_PERMISSIONS[role] = ['read']
   ```

   Catatan:
   - `['read']` berarti user hanya bisa membaca dataset private organisasi,
   - tidak ada permission `update_dataset`, sehingga user tidak bisa edit dataset/resource,
   - tidak ada permission `manage_group`, sehingga user tidak bisa mengatur organisasi/member.

3. Menampilkan role workflow di dropdown **Add Member**.

   Action `member_roles_list` di-chain oleh plugin:

   ```python
   @tk.chained_action
   @tk.side_effect_free
   def member_roles_list(original_action, context, data_dict):
       ...
   ```

   Catatan:
   - untuk `group_type='organization'`, plugin menambahkan `Validator`, `Verifikator`, dan `Publikator`,
   - untuk `group`, role workflow tidak ditampilkan supaya hanya berlaku di organisasi.

4. Mengecek role workflow berdasarkan membership organisasi.

   Fungsi `_has_workflow_role()` membaca dataset, mengambil `owner_org`, lalu mengecek apakah user punya capacity `validator`, `verificator`, atau `publikator` di organisasi tersebut.

   Catatan:
   - role workflow mengikuti organisasi dataset,
   - validator di organisasi A tidak otomatis menjadi validator di organisasi B,
   - `.env` masih bisa dipakai sebagai fallback global, tetapi alur utama sekarang lewat Members.

5. Membuat helper untuk menyembunyikan tombol edit resource.

   Helper template:

   ```python
   'statsworkflow_can_edit_resources': can_edit_resources
   ```

   Catatan:
   - helper mengembalikan `False` jika user adalah `Validator`, `Verifikator`, atau `Publikator`,
   - helper juga mengecek `package_update` untuk user biasa/editor,
   - anonymous user langsung dianggap tidak bisa edit.

6. Override template halaman resource.

   File yang dibuat:

   - [resource_read.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/resource_read.html)
   - [resources.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/resources.html)
   - [resource_item.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/resource_item.html)

   Catatan per file:
   - `resource_read.html` menyembunyikan tombol **Edit resource** di bagian kanan atas halaman resource.
   - `resources.html` menyembunyikan tombol **Add new resource** dan dropdown edit di sidebar resource.
   - `resource_item.html` menyembunyikan menu **Edit resource** pada item resource/list explore.

7. Mendaftarkan template ke extension.

   File yang diubah:

   - [setup.py](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/setup.py)

   Catatan:
   - `find_packages()` dipakai supaya package Python terbaca otomatis,
   - `package_data` mencatat template yang harus ikut extension,
   - `tk.add_template_directory(config, 'templates')` di `plugin.py` membuat CKAN membaca override template dari extension.

8. Restart atau recreate container CKAN.

   Setelah mengubah plugin/template, jalankan dari folder compose:

   ```bash
   cd /root/baru/docker-ckan/compose
   docker compose up -d --force-recreate ckan ckan-worker-default ckan-worker-bulk ckan-worker-priority
   ```

   Catatan:
   - recreate diperlukan saat `setup.py` atau package data berubah,
   - restart biasa cukup jika hanya mengubah Python/template yang sudah terbaca dari mount editable.

### Langkah Penggunaan di CKAN

1. Login ke CKAN sebagai sysadmin atau admin organisasi.
2. Buka halaman organisasi.
3. Masuk ke tab **Members**.
4. Klik **Add Member**.
5. Pilih user yang sudah ada atau invite user baru.
6. Pada dropdown **Role**, pilih salah satu:
   - `Validator`
   - `Verifikator`
   - `Publikator`
7. Simpan member.
8. Login sebagai user tersebut untuk memastikan:
   - dataset/resource masih bisa dilihat,
   - tombol **Edit resource** tidak muncul,
   - tombol **Add new resource** tidak muncul,
   - aksi workflow tetap muncul sesuai status dan role.

### Ringkasan File yang Terlibat

| File | Fungsi |
| --- | --- |
| [plugin.py](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py) | Logic workflow, role CKAN, permission readonly, helper tombol, route workflow |
| [setup.py](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/setup.py) | Registrasi package dan template extension |
| [read.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/read.html) | Menampilkan panel workflow di halaman dataset |
| [workflow_actions.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/workflow_actions.html) | Isi panel tombol workflow |
| [resource_read.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/resource_read.html) | Hide tombol Edit resource di halaman resource |
| [resources.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/resources.html) | Hide Add new resource dan dropdown edit resource |
| [resource_item.html](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/resource_item.html) | Hide menu Edit resource di item resource |

### Verifikasi Setelah Perbaikan

Perintah verifikasi:

```bash
python3 -m py_compile docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py

cd /root/baru/docker-ckan/compose
docker compose ps ckan
docker compose logs --tail=80 ckan
```

Hasil yang diharapkan:

- CKAN status `healthy`,
- log menampilkan `Loading new plugin: statsworkflow`,
- dropdown Add Member organisasi memuat `Validator`, `Verifikator`, `Publikator`,
- user dengan role tersebut tidak melihat tombol edit resource,
- backend tetap menolak akses edit jika URL edit dibuka manual.

## 12. Pemetaan Pekerjaan Terbaru: Topik, DataStore, Grafik, dan API

Bagian ini ditambahkan untuk mencatat pekerjaan terbaru tanpa mengubah bagian lama.

### Frontend yang Berubah

File utama:

- [portal-frontend/src/pages/Topik.jsx](/root/baru/portal-frontend/src/pages/Topik.jsx)
- [portal-frontend/src/pages/Organisasi.jsx](/root/baru/portal-frontend/src/pages/Organisasi.jsx)
- [portal-frontend/src/components/DatasetLineChart.jsx](/root/baru/portal-frontend/src/components/DatasetLineChart.jsx)
- [portal-frontend/src/styles/pages/topik.css](/root/baru/portal-frontend/src/styles/pages/topik.css)
- [portal-frontend/src/styles/pages/organisasi.css](/root/baru/portal-frontend/src/styles/pages/organisasi.css)
- [portal-frontend/src/utils/ckan.js](/root/baru/portal-frontend/src/utils/ckan.js)

Perubahan frontend:

- halaman Topik sekarang bisa membuka detail dataset,
- detail dataset Topik dibuat mirip detail dataset Organisasi,
- Topik dan Organisasi sama-sama menampilkan tabel DataStore dan grafik,
- tabel membaca kolom `Tahun 2015`, `Tahun 2016`, sampai `Tahun 2025`,
- angka besar dari DataStore diformat agar sesuai contoh Excel, misalnya `77720` menjadi `77,720`,
- baris header palsu dari Excel tidak ditampilkan sebagai data,
- grafik membaca baris data asli, bukan baris header palsu,
- komponen grafik tidak lagi menyingkat angka menjadi format `k`.

### Backend yang Berubah

File utama:

- [portal-api/app/Controllers/Dataset.php](/root/baru/portal-api/app/Controllers/Dataset.php)
- [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php)
- [portal-api/app/Controllers/Visitor.php](/root/baru/portal-api/app/Controllers/Visitor.php)

Perubahan backend:

- endpoint `GET /api/topics` membaca CKAN Groups,
- endpoint `GET /api/group-datasets?group=...` mengambil dataset berdasarkan group/topik CKAN,
- endpoint preview tetap memakai `GET /api/preview/:resourceId` untuk membaca DataStore,
- endpoint visitor tetap menjadi counter kunjungan portal.

Endpoint portal yang aktif untuk pengujian:

- `GET /api/datasets`
- `GET /api/dataset/:id`
- `GET /api/search?q=...`
- `GET /api/organizations`
- `GET /api/topics`
- `GET /api/group-datasets?group=sosial-dan-budaya`
- `GET /api/publications`
- `GET /api/preview/:resourceId`
- `GET /api/visitors`
- `POST /api/visitors/increment`
- `POST /api/login`
- `POST /api/auth/ckan/sync`

### Infrastruktur yang Berubah

File utama:

- [docker-ckan/compose/config/ckan/.env](/root/baru/docker-ckan/compose/config/ckan/.env)
- [docker-ckan/compose/services/datapusher/datapusher.yaml](/root/baru/docker-ckan/compose/services/datapusher/datapusher.yaml)

Perubahan infrastruktur:

- token API DataPusher diperbarui karena token lama ditolak CKAN,
- port DataPusher disesuaikan ke `8000:8000`,
- service `ckan` dan `datapusher` direcreate agar konfigurasi baru aktif.

### Catatan DataStore

DataStore CKAN bisa berisi field tahun dengan format:

```text
Tahun 2015
Tahun 2016
Tahun 2017
...
Tahun 2025
```

Frontend sekarang tidak bergantung pada nama kolom `2015` saja. Parser tahun membaca angka tahun dari nama kolom sehingga `Tahun 2015` tetap bisa dipakai untuk tabel dan grafik.

Jika Excel memiliki dua baris header, DataStore bisa ikut mengirim baris header kedua sebagai record. Frontend sekarang memfilter baris seperti itu agar tidak muncul sebagai data hijau/palsu di tabel.

### Catatan Visitor

`visitor` adalah penghitung kunjungan portal. Data ini bukan dari CKAN. Backend menyimpannya di SQLite:

```text
portal-api/writable/analytics/visitors.sqlite3
```

Endpoint terkait:

- `GET /api/visitors`
- `POST /api/visitors/increment`
