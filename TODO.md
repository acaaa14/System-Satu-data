# TODO Teknis

## Prioritas Tinggi

- Satukan pola routing frontend agar konsisten.
- Rapikan dokumentasi backend dan frontend supaya sesuai implementasi terbaru.
- Rapikan kontrak data CKAN untuk topik, publikasi, dan organisasi agar filtering tidak bergantung pada heuristik nama.
- Tambahkan loading, empty state, dan error state yang konsisten di semua halaman publik.
- Audit ulang route yang sudah didefinisikan backend tetapi belum punya halaman jelas seperti `/open-data` dan `/jadwal-rilis-dataset`.
- Evaluasi apakah endpoint login lama `POST /api/login` masih perlu dipertahankan sekarang setelah alur utama admin langsung ke CKAN.

## Prioritas Menengah

- Buat komponen reusable untuk tombol scroll-to-top.
- Konsolidasikan style hero/banner agar `Topik`, `Organisasi`, dan `Publikasi` berbagi pola yang sama.
- Tambahkan test dasar untuk helper frontend seperti `topics.js`, `publications.js`, dan `datasetVisibility.js`.
- Dokumentasikan kontrak response API dari backend ke frontend.
- Tambahkan validasi dan feedback yang lebih kuat di halaman admin/login.
- Kurangi duplikasi filter organisasi antara backend dan frontend agar satu sumber kebenaran lebih jelas.
- Tinjau kembali naming variabel backend seperti `$publicationGroup = "topik"` agar lebih merepresentasikan fungsi aktual.

## Prioritas Rendah

- Evaluasi apakah `react-router-dom` masih perlu dipakai atau bisa dihapus.
- Rapikan aset statis yang sudah tidak dipakai.
- Tambahkan diagram visual non-ASCII bila diperlukan untuk presentasi.
- Buat changelog ringan untuk perubahan fitur utama.
- Review file util yang masih tersisa dari implementasi lama bila tidak lagi dipakai langsung oleh halaman aktif.

## Catatan

Backlog ini sengaja difokuskan ke kondisi codebase aktual, bukan rencana versi lama.
