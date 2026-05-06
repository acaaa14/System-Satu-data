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

## Verifikasi

- `npm run build` berhasil.
- `npm run build:portal` berhasil dan hasil frontend production diperbarui ke `portal-api/public/frontend`.

## Kesimpulan

Pekerjaan terbaru mencakup keamanan dataset CKAN, perbaikan DataStore untuk file tabel dari portal, dan peningkatan tampilan frontend Organisasi agar user bisa masuk ke daftar dataset sesuai organisasi yang dipilih.
