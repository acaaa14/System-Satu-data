# Analisis Sistem dan Kesesuaian Implementasi

## 1. Definisi Sistem

Sistem ini adalah portal data Kota Tangerang yang:

- memakai CKAN sebagai sumber katalog data,
- memakai CodeIgniter 4 sebagai backend API dan penyaji build frontend,
- memakai React sebagai antarmuka pengguna,
- menyediakan halaman publik, pencarian, publikasi, topik, organisasi, login, dan admin.

## 2. Komponen yang Benar-Benar Ada di Repo

### Frontend

Lokasi: `portal-frontend/`

Implementasi yang aktif:
- `src/pages/Home.jsx`
- `src/pages/Organisasi.jsx`
- `src/pages/Topik.jsx`
- `src/pages/Publikasi.jsx`
- `src/pages/Search.jsx`
- `src/pages/Login.jsx`
- `src/pages/Admin.jsx`

Catatan:
- frontend memakai state dan routing manual berbasis `window.history`,
- React Router terpasang sebagai dependency, tetapi routing aktif saat ini tidak memakai `<Routes>`.

### Backend

Lokasi: `portal-api/`

Controller yang aktif:
- `Frontend.php`
- `Dataset.php`
- `Auth.php`
- `Visitor.php`
- `Home.php`

Tanggung jawab utama backend:
- menyajikan file build React dari `public/frontend/index.html`,
- menyediakan endpoint API untuk frontend,
- meneruskan request tertentu ke CKAN,
- menyimpan counter pengunjung sederhana via SQLite.

### Platform data

Lokasi konfigurasi: `docker-ckan/`

Service yang menjadi bagian arsitektur:
- CKAN
- PostgreSQL
- Solr
- Redis
- Datapusher

## 3. Alur Sistem Aktual

1. User membuka route publik.
2. CodeIgniter route frontend mengarah ke `Frontend::index`.
3. Browser menerima shell aplikasi React.
4. React memanggil `/api/*` ke backend.
5. Backend mengambil data ke CKAN untuk dataset, organisasi, search, dan preview.
6. Data hasil backend dipakai untuk merender halaman publik.

## 4. Endpoint yang Aktif

### Frontend route

- `/`
- `/organisasi`
- `/publikasi`
- `/topik`
- `/pencarian`
- `/open-data`
- `/jadwal-rilis-dataset`
- `/login`
- `/admin`
- `/dataset/:id`

### API route

- `GET /api/datasets`
- `GET /api/organizations`
- `GET /api/dataset/:id`
- `GET /api/search`
- `GET /api/preview/:id`
- `GET /api/visitors`
- `POST /api/visitors/increment`
- `POST /api/login`
- `POST /api/admin/dataset`
- `PUT /api/admin/dataset/:id`
- `DELETE /api/admin/dataset/:id`

## 5. Kesesuaian Implementasi

| Area | Status | Catatan |
| --- | --- | --- |
| Frontend React aktif | Sesuai | Halaman publik utama sudah ada |
| CodeIgniter sebagai host frontend | Sesuai | `Frontend::index` melayani build React |
| CKAN sebagai sumber data | Sesuai | Dipakai untuk dataset, organisasi, search, preview |
| Login admin | Sesuai | Endpoint login tersedia |
| Halaman publikasi | Sesuai | Data publikasi masih local/browser storage |
| Statistik portal | Sebagian | Sebagian dari CKAN, sebagian dari local state/storage |
| Visitor analytics | Sesuai | Counter sederhana via SQLite |
| Dokumentasi lama | Belum sesuai | Perlu diselaraskan dengan implementasi aktual |

## 6. Temuan Penting

- Dokumentasi lama masih menyebut struktur halaman dan route versi lama.
- Frontend saat ini lebih banyak memakai route manual daripada React Router.
- Publikasi belum berasal dari backend/CKAN; masih dibaca dari storage frontend.
- Counter pengunjung sudah ada, tetapi belum terdokumentasi rapi sebelumnya.

## 7. Bukti Implementasi di Kode

- `Frontend: React.js + Bootstrap`
  Bukti dependency ada di [portal-frontend/package.json](/root/baru/portal-frontend/package.json:13), yaitu `react`, `react-dom`, dan `bootstrap`.

```json
// File: portal-frontend/package.json
// Letak: dependencies
{
  "dependencies": {
    "bootstrap": "^5.3.8",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  }
}
```

- `CodeIgniter 4 sebagai backend dan renderer frontend`
  Bukti framework ada di [portal-api/composer.json](/root/baru/portal-api/composer.json:12), yaitu `codeigniter4/framework`.
  Bukti renderer ada di [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php:8) dan [portal-api/app/Controllers/Frontend.php](/root/baru/portal-api/app/Controllers/Frontend.php:10).

```json
// File: portal-api/composer.json
// Letak: require
{
  "require": {
    "codeigniter4/framework": "^4.0",
    "firebase/php-jwt": "^7.0"
  }
}
```

```php
// File: portal-api/app/Config/Routes.php
// Letak: route frontend utama
$routes->get('/', 'Frontend::index');
$routes->get('organisasi', 'Frontend::index');
$routes->get('publikasi', 'Frontend::index');
$routes->get('topik', 'Frontend::index');
$routes->get('pencarian', 'Frontend::index');
```

```php
// File: portal-api/app/Controllers/Frontend.php
// Letak: method index()
public function index(?string $path = null)
{
    $indexFile = FCPATH . 'frontend/index.html';

    return $this->response
        ->setContentType('text/html')
        ->setBody((string) file_get_contents($indexFile));
}
```

- `JWT di backend`
  Bukti dependency ada di [portal-api/composer.json](/root/baru/portal-api/composer.json:12), yaitu `firebase/php-jwt`.
  Bukti route login ada di [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php:34).

```php
// File: portal-api/app/Config/Routes.php
// Letak: route autentikasi dan admin
$routes->post('api/login', 'Auth::login');
$routes->post('api/admin/dataset', 'Dataset::create', ['filter'=>'jwt']);
$routes->put('api/admin/dataset/(:segment)', 'Dataset::update/$1', ['filter'=>'jwt']);
$routes->delete('api/admin/dataset/(:segment)', 'Dataset::delete/$1', ['filter'=>'jwt']);
```

- `CKAN sebagai data platform`
  Bukti endpoint CKAN dipakai backend ada di [portal-api/app/Controllers/Dataset.php](/root/baru/portal-api/app/Controllers/Dataset.php:10).
  Bukti service CKAN ada di [docker-ckan/compose/services/ckan/ckan.yaml](/root/baru/docker-ckan/compose/services/ckan/ckan.yaml:3).

```php
// File: portal-api/app/Controllers/Dataset.php
// Letak: deklarasi endpoint CKAN + helper request
private $ckan = "http://ckan:5000/api/3/action";

private function requestCkan($endpoint)
{
    $client = \Config\Services::curlrequest(["timeout" => 10]);
    $response = $client->get($this->ckan . $endpoint);
    return json_decode($response->getBody(), true);
}
```

```yaml
# File: docker-ckan/compose/services/ckan/ckan.yaml
# Letak: definisi service CKAN
services:
  ckan:
    image: ghcr.io/keitaroinc/ckan:${CKAN_VERSION}
```

- `PostgreSQL sebagai database utama platform data`
  Bukti stack database diorkestrasi dari [docker-ckan/compose/docker-compose.yml](/root/baru/docker-ckan/compose/docker-compose.yml:25).

```yaml
# File: docker-ckan/compose/docker-compose.yml
# Letak: include services
include:
  - path: services/ckan/ckan.yaml
  - path: services/db/db.yaml
  - path: services/solr/solr.yaml
  - path: services/redis/redis.yaml
```

- `Docker sebagai container orchestrator`
  Bukti ada di [docker-ckan/compose/docker-compose.yml](/root/baru/docker-ckan/compose/docker-compose.yml:1), karena seluruh service CKAN, db, redis, solr, datapusher, portal-api, dan portal-frontend digabung di sana.

```yaml
# File: docker-ckan/compose/docker-compose.yml
# Letak: root compose stack
name: ckan

include:
  - path: services/ckan/ckan.yaml
  - path: services/portal-api/portal-api.yaml
  - path: services/portal-frontend/portal-frontend.yaml
```

- `Bootstrap untuk warna, tombol, dan tata letak`
  Bukti penggunaan langsung bisa dilihat di [portal-api/app/Views/home.php](/root/baru/portal-api/app/Views/home.php:12), yaitu import CDN Bootstrap dan class seperti `btn`, `card`, `row`, serta `col-lg-7`.

```html
<!-- File: portal-api/app/Views/home.php -->
<!-- Letak: head dan body -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
  rel="stylesheet"
>

<div class="card hero-card">
  <div class="row g-0">
    <div class="col-lg-7">
      <a href="/api/datasets" class="btn btn-light btn-lg">Lihat API Dataset</a>
    </div>
  </div>
</div>
```

## 8. Kesimpulan

Secara implementasi, sistem sudah berbentuk portal data terpadu yang berjalan dengan baik di atas React + CodeIgniter 4 + CKAN. Tantangan terbesarnya bukan lagi arsitektur inti, tetapi sinkronisasi dokumentasi, konsolidasi routing frontend, dan pematangan sumber data untuk fitur yang masih lokal seperti publikasi.
