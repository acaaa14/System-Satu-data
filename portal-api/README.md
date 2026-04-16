# Portal API

Backend ini dibangun dengan CodeIgniter 4 dan berfungsi sebagai:

- penyaji build frontend React production,
- proxy API ke CKAN,
- endpoint login admin,
- endpoint visitor counter.

## Controller Aktif

- `Frontend.php`: mengirim `public/frontend/index.html` untuk route frontend.
- `Dataset.php`: list dataset, detail, search, preview, dan organisasi dari CKAN.
- `Auth.php`: login admin.
- `Visitor.php`: baca dan tambah counter pengunjung berbasis SQLite.

## Route Penting

### Frontend host

- `/`
- `/organisasi`
- `/publikasi`
- `/topik`
- `/pencarian`
- `/login`
- `/admin`
- `/dataset/:id`

### API

- `GET /api/datasets`
- `GET /api/organizations`
- `GET /api/dataset/:id`
- `GET /api/search`
- `GET /api/preview/:id`
- `GET /api/visitors`
- `POST /api/visitors/increment`
- `POST /api/login`

## Catatan

- Build React harus tersedia di `public/frontend/index.html`.
- Jika file build belum ada, `Frontend::index` akan melempar page not found.
- Counter pengunjung disimpan di `writable/analytics/visitors.sqlite3`.

