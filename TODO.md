# TODO Teknis

## Prioritas Tinggi

- Satukan pola routing frontend agar konsisten.
- Rapikan dokumentasi backend dan frontend supaya sesuai implementasi terbaru.
- Pindahkan data publikasi dari local storage ke backend atau sumber data yang lebih stabil.
- Tambahkan loading, empty state, dan error state yang konsisten di semua halaman publik.
- Audit ulang route yang sudah didefinisikan backend tetapi belum punya halaman jelas seperti `/open-data` dan `/jadwal-rilis-dataset`.

## Prioritas Menengah

- Buat komponen reusable untuk tombol scroll-to-top.
- Konsolidasikan style hero/banner agar `Topik`, `Organisasi`, dan `Publikasi` berbagi pola yang sama.
- Tambahkan test dasar untuk helper frontend seperti `topics.js`, `publications.js`, dan `datasetVisibility.js`.
- Dokumentasikan kontrak response API dari backend ke frontend.
- Tambahkan validasi dan feedback yang lebih kuat di halaman admin/login.

## Prioritas Rendah

- Evaluasi apakah `react-router-dom` masih perlu dipakai atau bisa dihapus.
- Rapikan aset statis yang sudah tidak dipakai.
- Tambahkan diagram visual non-ASCII bila diperlukan untuk presentasi.
- Buat changelog ringan untuk perubahan fitur utama.

## Catatan

Backlog ini sengaja difokuskan ke kondisi codebase aktual, bukan rencana versi lama.

