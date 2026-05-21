# Logbook Pengerjaan

Dokumen ini berisi ringkasan pekerjaan yang sudah dilakukan beserta bukti link langsung ke file dan nomor line.

## Ringkasan Kegiatan

| No | Tanggal | Kegiatan | Hasil | Bukti Line |
| --- | --- | --- | --- | --- |
| 1 | 29 April 2026 | Membuat extension CKAN untuk membatasi Visibility | Editor dipaksa `Private`, sedangkan `Public` hanya untuk sysadmin/admin organisasi. | [class plugin](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:148), [auth functions](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:170), [cek public](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:176) |
| 2 | 29 April 2026 | Menambahkan validasi backend create/update dataset | Editor tetap bisa membuat dataset, tetapi tidak bisa menjadikan dataset `Public`. | [package_create](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:192), [paksa private](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:195), [package_update](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:198) |
| 3 | 29 April 2026 | Override dropdown Visibility CKAN | Editor hanya melihat pilihan `Private`; `Public` muncul untuk admin yang berhak. | [template visibility](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/templates/package/snippets/package_basic_fields.html:3), [helper izin](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/templates/package/snippets/package_basic_fields.html:6), [opsi public](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/templates/package/snippets/package_basic_fields.html:8) |
| 4 | 29 April 2026 | Mengaktifkan plugin CKAN lokal | Plugin `restrict_visibility` dimasukkan ke konfigurasi CKAN. | [CKAN plugins](/root/baru/docker-ckan/compose/config/ckan/.env:30) |
| 5 | 29 April 2026 | Menyiapkan auto-install extension CKAN | CKAN dan worker menginstall extension lokal saat container start. | [service CKAN](/root/baru/docker-ckan/compose/services/ckan/ckan.yaml:23), [worker default](/root/baru/docker-ckan/compose/services/ckan-workers/ckan-worker-default.yaml:25), [worker bulk](/root/baru/docker-ckan/compose/services/ckan-workers/ckan-worker-bulk.yaml:25), [worker priority](/root/baru/docker-ckan/compose/services/ckan-workers/ckan-worker-priority.yaml:25) |
| 6 | 30 April 2026 | Memperbaiki DataStore untuk file `.xls` yang sebenarnya HTML table | File HTML table ber-ekstensi `.xls` dikonversi sementara menjadi CSV agar bisa masuk DataStore. | [parser HTML](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:7), [deteksi HTML table](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:35), [convert CSV](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:76) |
| 7 | 30 April 2026 | Menormalkan header tabel bertingkat | Header seperti `Tahun` + `2015-2025` dirapikan agar tidak menyebabkan duplicate column di DataStore. | [unique headers](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:48), [header Tahun](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:62), [patch xloader](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:103) |
| 8 | 30 April 2026 | Memperbaiki namespace extension CKAN | Namespace `ckanext` diperluas supaya extension lokal tidak menutup extension lain. | [extend_path](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/__init__.py:1) |
| 9 | 6 Mei 2026 | Membuat klik organisasi membuka detail dataset | Saat kartu organisasi diklik, halaman berubah menjadi tampilan detail seperti contoh dan route `/organisasi` aman saat reload. | [route organisasi](/root/baru/portal-frontend/src/App.jsx:29), [state selected](/root/baru/portal-frontend/src/pages/Organisasi.jsx:71), [fungsi pilih organisasi](/root/baru/portal-frontend/src/pages/Organisasi.jsx:147), [kartu bisa diklik](/root/baru/portal-frontend/src/pages/Organisasi.jsx:280) |
| 10 | 6 Mei 2026 | Mengambil dataset dan memfilter berdasarkan organisasi | Dataset dari CKAN difilter sesuai organisasi yang dipilih. | [fetch datasets](/root/baru/portal-frontend/src/pages/Organisasi.jsx:4), [ambil data paralel](/root/baru/portal-frontend/src/pages/Organisasi.jsx:86), [filter organisasi](/root/baru/portal-frontend/src/pages/Organisasi.jsx:46), [selected datasets](/root/baru/portal-frontend/src/pages/Organisasi.jsx:116) |
| 11 | 6 Mei 2026 | Menambahkan pencarian dan pagination di detail organisasi | Detail organisasi punya search, jumlah dataset ditemukan, daftar dataset, dan navigasi halaman. | [search dataset](/root/baru/portal-frontend/src/pages/Organisasi.jsx:126), [pagination data](/root/baru/portal-frontend/src/pages/Organisasi.jsx:142), [input cari](/root/baru/portal-frontend/src/pages/Organisasi.jsx:188), [tombol pagination](/root/baru/portal-frontend/src/pages/Organisasi.jsx:218) |
| 12 | 6 Mei 2026 | Menyesuaikan tampilan detail organisasi | Layout dibuat seperti contoh: breadcrumb, sidebar organisasi, logo, daftar dataset kanan, search, pagination. | [background detail](/root/baru/portal-frontend/src/styles/pages/organisasi.css:232), [layout detail](/root/baru/portal-frontend/src/styles/pages/organisasi.css:277), [sidebar](/root/baru/portal-frontend/src/styles/pages/organisasi.css:290), [toolbar search](/root/baru/portal-frontend/src/styles/pages/organisasi.css:347), [link dataset](/root/baru/portal-frontend/src/styles/pages/organisasi.css:388), [pagination](/root/baru/portal-frontend/src/styles/pages/organisasi.css:408) |
| 13 | 6 Mei 2026 | Membuat klik isi dataset membuka detail data | Nama dataset di detail organisasi sekarang membuka halaman detail dataset di portal. | [state dataset](/root/baru/portal-frontend/src/pages/Organisasi.jsx:151), [open dataset](/root/baru/portal-frontend/src/pages/Organisasi.jsx:294), [klik dataset](/root/baru/portal-frontend/src/pages/Organisasi.jsx:449), [render detail](/root/baru/portal-frontend/src/pages/Organisasi.jsx:299) |
| 14 | 6 Mei 2026 | Menampilkan tabel dataset dari DataStore | Detail dataset mengambil preview resource dan menampilkan tabel data. | [ambil detail dataset](/root/baru/portal-frontend/src/pages/Organisasi.jsx:214), [ambil preview](/root/baru/portal-frontend/src/pages/Organisasi.jsx:217), [kolom tabel](/root/baru/portal-frontend/src/pages/Organisasi.jsx:80), [render tabel](/root/baru/portal-frontend/src/pages/Organisasi.jsx:345) |
| 15 | 6 Mei 2026 | Menambahkan grafik ketika scroll ke bawah | Kolom tahun otomatis diubah menjadi data grafik garis. | [import recharts](/root/baru/portal-frontend/src/pages/Organisasi.jsx:2), [build chart data](/root/baru/portal-frontend/src/pages/Organisasi.jsx:112), [render grafik](/root/baru/portal-frontend/src/pages/Organisasi.jsx:368), [style grafik](/root/baru/portal-frontend/src/styles/pages/organisasi.css:571) |
| 16 | 6 Mei 2026 | Menambahkan tombol download di detail dataset | Detail dataset menampilkan tombol download XLS, XML, PDF, JSON, dan JSON Detail. | [cari resource format](/root/baru/portal-frontend/src/pages/Organisasi.jsx:57), [download formats](/root/baru/portal-frontend/src/pages/Organisasi.jsx:303), [tombol download](/root/baru/portal-frontend/src/pages/Organisasi.jsx:323), [style download](/root/baru/portal-frontend/src/styles/pages/organisasi.css:491) |
| 17 | 6 Mei 2026 | Menormalkan header tahun di aplikasi | Jika DataStore lama memakai nilai data sebagai nama kolom, frontend menyusun ulang header menjadi `No`, `Uraian`, `2015-2025`, dan grafik bisa membaca tahun. | [preview fields](/root/baru/portal-frontend/src/utils/ckan.js:60), [field ids](/root/baru/portal-frontend/src/pages/Organisasi.jsx:75), [deteksi header rusak](/root/baru/portal-frontend/src/pages/Organisasi.jsx:98), [susun ulang tabel](/root/baru/portal-frontend/src/pages/Organisasi.jsx:109), [pakai preview fields](/root/baru/portal-frontend/src/pages/Organisasi.jsx:249) |
| 18 | 20 Mei 2026 | Menambahkan tombol workflow publikasi di CKAN | Halaman detail dataset CKAN menampilkan status workflow dan tombol aksi sesuai role/status. | [mapping tombol](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:54), [helper tombol](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:457), [endpoint tombol](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:482), [template panel](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/workflow_actions.html:1) |
| 19 | 20 Mei 2026 | Mendaftarkan route dan template workflow CKAN | Extension `statsworkflow` memakai `IBlueprint` untuk endpoint POST tombol dan memasukkan template baru ke package data. | [register blueprint](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:613), [override read](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/read.html:1), [package data](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/setup.py:9) |

## Detail Singkat

### 1. Pembatasan Visibility CKAN

Fitur ini dibuat melalui extension lokal, bukan dengan mengubah core CKAN. Tujuannya agar editor tidak bisa membuat atau mengubah dataset menjadi `Public`.

Bukti utama:

- [RestrictVisibilityPlugin](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:148)
- [package_create](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:192)
- [package_update](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:198)

### 2. Perbaikan DataStore

Masalah DataStore pada file `.xls` terjadi karena beberapa file sebenarnya berisi HTML table, bukan Excel asli. Extension kemudian diberi parser tambahan agar HTML table dikonversi sementara menjadi CSV sebelum masuk xloader.

Bukti utama:

- [HTML parser](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:7)
- [convert HTML table ke CSV](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:76)
- [patch xloader](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:103)

### 3. Detail Dataset Organisasi

Halaman Organisasi sekarang tidak berhenti di kartu organisasi. Ketika organisasi diklik, user melihat daftar dataset milik organisasi tersebut, lengkap dengan pencarian dan pagination.

Bukti utama:

- [ambil dataset CKAN](/root/baru/portal-frontend/src/pages/Organisasi.jsx:86)
- [filter dataset organisasi](/root/baru/portal-frontend/src/pages/Organisasi.jsx:46)
- [render detail organisasi](/root/baru/portal-frontend/src/pages/Organisasi.jsx:160)
- [tampilan detail CSS](/root/baru/portal-frontend/src/styles/pages/organisasi.css:232)

### 4. Detail Isi Dataset dan Grafik

Ketika nama dataset diklik dari detail organisasi, portal membuka tampilan isi dataset. Data tabel diambil dari preview DataStore, sedangkan grafik dibuat dari kolom tahun yang tersedia di record pertama.

Bukti utama:

- [klik dataset](/root/baru/portal-frontend/src/pages/Organisasi.jsx:449)
- [preview DataStore](/root/baru/portal-frontend/src/pages/Organisasi.jsx:217)
- [render tabel](/root/baru/portal-frontend/src/pages/Organisasi.jsx:345)
- [render grafik](/root/baru/portal-frontend/src/pages/Organisasi.jsx:368)

### 5. Workflow Publikasi CKAN

Extension `ckanext-statsworkflow` mengatur alur publikasi dataset dari draft sampai published. Perubahan status tidak dilakukan lewat field Custom Field biasa, tetapi lewat action `statsworkflow_*` agar status tidak bisa dilompati manual.

Panel **Workflow Publikasi** ditambahkan ke halaman detail dataset CKAN. Panel ini menampilkan status saat ini dan tombol yang sesuai:

- `draft` / `revision_from_validator` / `revision_from_verificator`: tombol **Kirim ke Validator** untuk editor yang berhak.
- `waiting_validation`: tombol **Minta Revisi** dan **Setujui Validasi** untuk validator.
- `waiting_verification`: tombol **Minta Revisi** dan **Setujui Verifikasi** untuk verifikator.
- `waiting_publish`: tombol **Publish** untuk publikator.

Bukti utama:

- [mapping action tombol](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:54)
- [pemilihan tombol sesuai akses](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:457)
- [endpoint POST transisi](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py:482)
- [template panel workflow](/root/baru/docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/templates/package/snippets/workflow_actions.html:1)

## Verifikasi

- `npm run build` berhasil.
- `npm run build:portal` berhasil dan hasil frontend production diperbarui ke `portal-api/public/frontend`.
- `python3 -m py_compile docker-ckan/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py` berhasil.
- `docker exec ckan-ckan-1 python -m py_compile /app/extensions/ckanext-statsworkflow/ckanext/statsworkflow/plugin.py` berhasil.
- Halaman dataset CKAN lokal merender panel **Workflow Publikasi** dengan HTTP 200 setelah container `ckan-ckan-1` direstart.

## Tambahan Pekerjaan 21 Mei 2026

Bagian ini menambahkan catatan pekerjaan terbaru tanpa menghapus catatan lama.

### 6. Perbaikan DataPusher dan DataStore CKAN

Masalah upload ke DataStore menampilkan error `Process completed but unable to post to result_url`. Setelah log container dicek, penyebabnya adalah token API DataPusher tidak valid sehingga CKAN menolak request dengan `403` dan pesan `Cannot decode JWT token: Signature verification failed`.

Perbaikan yang dilakukan:

- membuat token API CKAN baru untuk user `sysadmin`,
- mengganti `CKAN__DATAPUSHER__API_TOKEN` di konfigurasi CKAN,
- menyesuaikan port DataPusher dari `8000:8800` menjadi `8000:8000`,
- restart/recreate service `ckan` dan `datapusher`,
- reset task DataPusher lama yang tersangkut `pending` agar upload bisa dicoba ulang.

Bukti utama:

- [token datapusher](/root/baru/docker-ckan/compose/config/ckan/.env:33)
- [port datapusher](/root/baru/docker-ckan/compose/services/datapusher/datapusher.yaml:6)
- [DATAPUSHER_PORT](/root/baru/docker-ckan/compose/services/datapusher/datapusher.yaml:16)

### 7. Integrasi Halaman Topik dengan CKAN Groups

Halaman Topik portal sebelumnya belum membaca relasi CKAN Groups secara penuh. Di CKAN, topik seperti `sosial-dan-budaya` adalah group langsung, sedangkan portal sebelumnya mencari group bernama `topik`.

Perbaikan yang dilakukan:

- endpoint `/api/topics` sekarang membaca CKAN `group_list?all_fields=true&include_dataset_count=true`,
- endpoint baru `/api/group-datasets` mengambil dataset berdasarkan slug group CKAN,
- frontend Topik memakai data group CKAN untuk count dan detail dataset.

Bukti utama:

- [topics backend](/root/baru/portal-api/app/Controllers/Dataset.php:369)
- [group datasets backend](/root/baru/portal-api/app/Controllers/Dataset.php:415)
- [route group datasets](/root/baru/portal-api/app/Config/Routes.php:29)
- [fetch group datasets](/root/baru/portal-frontend/src/utils/ckan.js:43)
- [open topic](/root/baru/portal-frontend/src/pages/Topik.jsx:260)

### 8. Detail Dataset Topik Disamakan dengan Organisasi

Ketika dataset dibuka dari halaman Topik, tampilannya sekarang mengikuti detail dataset di Organisasi:

- breadcrumb,
- tombol download `XLS`, `XML`, `PDF`, `JSON`, dan `JSON Detail`,
- tabel dari DataStore,
- grafik garis dari kolom tahun,
- loading dan error state untuk preview DataStore.

Bukti utama:

- [detail dataset Topik](/root/baru/portal-frontend/src/pages/Topik.jsx:414)
- [download Topik](/root/baru/portal-frontend/src/pages/Topik.jsx:437)
- [render tabel Topik](/root/baru/portal-frontend/src/pages/Topik.jsx:459)
- [render grafik Topik](/root/baru/portal-frontend/src/pages/Topik.jsx:498)
- [style detail Topik](/root/baru/portal-frontend/src/styles/pages/topik.css:379)

### 9. Penyesuaian Tabel dan Grafik agar Sesuai Data Excel

Data dari Excel/DataStore memiliki kolom seperti `Tahun 2015`, `Tahun 2016`, dan seterusnya. Frontend sekarang membaca format tersebut dan bukan hanya kolom `2015`.

Perbaikan yang dilakukan di halaman Topik dan Organisasi:

- kolom `Tahun 2015` sampai `Tahun 2025` dibaca sebagai data tahun,
- nilai besar seperti `77720` ditampilkan sebagai `77,720`,
- nilai `100` tetap ditampilkan sebagai `100`,
- baris header palsu dari Excel tidak lagi ditampilkan sebagai data,
- grafik memakai baris data asli setelah header palsu dibuang,
- header tabel tahun dibuat bertingkat dengan label `Tahun Ke` dan `>2015`, `>2016`, dan seterusnya.

Bukti utama:

- [parser tahun Topik](/root/baru/portal-frontend/src/pages/Topik.jsx:116)
- [filter header palsu Topik](/root/baru/portal-frontend/src/pages/Topik.jsx:165)
- [format tabel Topik](/root/baru/portal-frontend/src/pages/Topik.jsx:148)
- [parser tahun Organisasi](/root/baru/portal-frontend/src/pages/Organisasi.jsx:120)
- [filter header palsu Organisasi](/root/baru/portal-frontend/src/pages/Organisasi.jsx:169)
- [format tabel Organisasi](/root/baru/portal-frontend/src/pages/Organisasi.jsx:152)
- [format grafik](/root/baru/portal-frontend/src/components/DatasetLineChart.jsx:12)

### 10. Checklist API untuk Pengujian Postman

Endpoint portal yang perlu dites:

- `GET http://localhost:8081/api/datasets`
- `GET http://localhost:8081/api/dataset/cakupan-penduduk-usia-lanjut-yang-mendapatkan-layanan-kesehatan`
- `GET http://localhost:8081/api/search?q=kesehatan`
- `GET http://localhost:8081/api/organizations`
- `GET http://localhost:8081/api/topics`
- `GET http://localhost:8081/api/group-datasets?group=sosial-dan-budaya`
- `GET http://localhost:8081/api/publications`
- `GET http://localhost:8081/api/preview/003a71e0-098a-4d65-858e-a5ebfd5923cc`
- `GET http://localhost:8081/api/visitors`
- `POST http://localhost:8081/api/visitors/increment`
- `POST http://localhost:8081/api/login`

Body untuk login portal:

```json
{
  "username": "admin",
  "password": "123456"
}
```

Endpoint CKAN yang perlu dites:

- `GET http://localhost:5000/api/3/action/status_show`
- `GET http://localhost:5000/api/3/action/group_list?all_fields=true&include_dataset_count=true`
- `GET http://localhost:5000/api/3/action/group_show?id=sosial-dan-budaya&include_datasets=true`
- `GET http://localhost:5000/api/3/action/package_search?fq=groups:sosial-dan-budaya`
- `GET http://localhost:5000/api/3/action/package_show?id=cakupan-penduduk-usia-lanjut-yang-mendapatkan-layanan-kesehatan`
- `GET http://localhost:5000/api/3/action/datastore_search?resource_id=003a71e0-098a-4d65-858e-a5ebfd5923cc&limit=20`

### 11. Catatan Visitor Counter

`visitor` adalah penghitung kunjungan portal. Fitur ini bukan data dari CKAN, melainkan statistik sederhana portal yang disimpan di SQLite lokal.

Bukti utama:

- [controller visitor](/root/baru/portal-api/app/Controllers/Visitor.php:1)
- [route visitor](/root/baru/portal-api/app/Config/Routes.php:33)
- [file SQLite visitor](/root/baru/portal-api/writable/analytics/visitors.sqlite3)

## Kesimpulan

Pekerjaan terbaru mencakup keamanan dataset CKAN, perbaikan DataStore untuk file tabel dari portal, dan peningkatan tampilan frontend Organisasi agar user bisa masuk ke daftar dataset sesuai organisasi yang dipilih.

Tambahan pekerjaan terbaru juga mencakup workflow publikasi bertahap di CKAN, perbaikan token/port DataPusher, integrasi Topik dengan CKAN Groups, detail dataset Topik, penyesuaian tabel/grafik agar mengikuti data Excel/DataStore, serta checklist API untuk pengujian Postman.
