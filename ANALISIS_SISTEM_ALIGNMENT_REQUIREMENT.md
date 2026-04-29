# Analisis Sistem dan Kesesuaian Implementasi

## 1. Definisi Sistem

Sistem ini adalah portal data Kota Tangerang yang:

- memakai CKAN sebagai sumber katalog data,
- memakai CodeIgniter 4 sebagai backend API dan penyaji build frontend,
- memakai React sebagai antarmuka pengguna,
- menyediakan halaman publik, pencarian, publikasi, topik, organisasi, login, dan admin,
- memakai CKAN sebagai titik login utama untuk akses admin portal.

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
- menyaring organisasi tertentu agar tidak dobel tampil dengan area publikasi,
- memvalidasi session CKAN lalu menerbitkan JWT internal portal,
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
5. Backend mengambil data ke CKAN untuk dataset, organisasi, publikasi, topik, search, dan preview.
6. Data hasil backend dipakai untuk merender halaman publik.

### Alur login admin aktual

1. User klik tombol `Login`.
2. Frontend langsung mengarah ke halaman login CKAN.
3. Setelah login berhasil, CKAN mengembalikan browser ke `/login?sync=ckan`.
4. Frontend memanggil `POST /api/auth/ckan/sync`.
5. Backend memverifikasi cookie session CKAN dengan request ke dashboard CKAN.
6. Jika valid, backend membuat JWT portal dan frontend mengarah ke `/admin`.

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
- `GET /api/publications`
- `GET /api/topics`
- `GET /api/dataset/:id`
- `GET /api/search`
- `GET /api/preview/:id`
- `GET /api/visitors`
- `POST /api/visitors/increment`
- `POST /api/login`
- `POST /api/auth/ckan/sync`
- `POST /api/admin/dataset`
- `PUT /api/admin/dataset/:id`
- `DELETE /api/admin/dataset/:id`

## 5. Kesesuaian Implementasi

| Area | Status | Catatan |
| --- | --- | --- |
| Frontend React aktif | Sesuai | Halaman publik utama sudah ada |
| CodeIgniter sebagai host frontend | Sesuai | `Frontend::index` melayani build React |
| CKAN sebagai sumber data | Sesuai | Dipakai untuk dataset, organisasi, publikasi, topik, search, preview |
| Login admin | Sesuai | Alur utama langsung ke CKAN lalu sinkronisasi session ke JWT portal |
| Pembatasan visibility dataset | Sesuai | Editor hanya dapat membuat dataset Private; Public hanya untuk sysadmin dan admin organisasi |
| Halaman publikasi | Sesuai | Data publikasi berasal dari CKAN group tertentu melalui backend |
| Halaman topik | Sesuai | Lima topik utama tetap ada, tetapi isinya diperkaya dari CKAN |
| Statistik portal | Sebagian | Sebagian dari CKAN, sebagian dari state lokal/helper frontend |
| Visitor analytics | Sesuai | Counter sederhana via SQLite |
| Dokumentasi lama | Belum sesuai | Perlu diselaraskan dengan implementasi aktual |

## 6. Temuan Penting

- Dokumentasi lama masih menyebut struktur halaman dan route versi lama.
- Frontend saat ini lebih banyak memakai route manual daripada React Router.
- Publikasi sekarang berasal dari CKAN melalui endpoint backend khusus.
- Topik tidak lagi sepenuhnya statis; data isi kartunya berasal dari CKAN, tetapi daftar lima topik utama tetap dijaga di frontend.
- Organisasi tertentu disaring dari halaman Organisasi jika sudah dipakai di alur publikasi atau dianggap sebagai topik.
- Counter pengunjung sudah ada, tetapi belum terdokumentasi rapi sebelumnya.
- Hak akses visibility dataset diperkuat melalui extension CKAN, bukan dengan mengubah file core CKAN seperti `create.py` atau `update.py`.

### Pembatasan visibility dataset

Sistem menerapkan aturan bahwa dataset berstatus `Public` hanya boleh dibuat atau diubah oleh sysadmin dan admin organisasi. User dengan role editor tetap dapat membuat dataset, tetapi pilihan visibility yang tersedia hanya `Private`.

Implementasi dilakukan melalui extension `ckanext-restrict_visibility` agar perubahan tidak langsung menyentuh source utama CKAN. Extension ini bekerja di dua lapisan:

- lapisan backend CKAN melalui `IAuthFunctions`, untuk memaksa dataset editor menjadi `Private` dan menolak update ke `Public`,
- lapisan tampilan CKAN melalui override template, untuk menyembunyikan opsi `Public` dari dropdown Visibility bagi editor.

Dengan pendekatan ini, pembatasan tidak hanya terjadi di tampilan. Jika editor mencoba mengirim nilai `private=False` melalui request manual atau API, backend CKAN tetap melakukan validasi dan menolak perubahan tersebut.

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
$routes->post('api/auth/ckan/sync', 'Auth::syncCkanSession');
$routes->post('api/admin/dataset', 'Dataset::create', ['filter'=>'jwt']);
$routes->put('api/admin/dataset/(:segment)', 'Dataset::update/$1', ['filter'=>'jwt']);
$routes->delete('api/admin/dataset/(:segment)', 'Dataset::delete/$1', ['filter'=>'jwt']);
```

- `Login portal diarahkan langsung ke CKAN`
  Bukti redirect login ada di [portal-frontend/src/components/Header.jsx](/root/baru/portal-frontend/src/components/Header.jsx:2), [portal-frontend/src/pages/Admin.jsx](/root/baru/portal-frontend/src/pages/Admin.jsx:3), dan [portal-frontend/src/pages/Login.jsx](/root/baru/portal-frontend/src/pages/Login.jsx:7).
  Bukti pembuatan URL login CKAN ada di [portal-frontend/src/utils/ckanAuth.js](/root/baru/portal-frontend/src/utils/ckanAuth.js:1).

- `Publikasi berasal dari CKAN`
  Bukti endpoint backend ada di [portal-api/app/Controllers/Dataset.php](/root/baru/portal-api/app/Controllers/Dataset.php:145) dan [portal-api/app/Config/Routes.php](/root/baru/portal-api/app/Config/Routes.php:25).
  Bukti frontend memakai endpoint itu ada di [portal-frontend/src/utils/ckan.js](/root/baru/portal-frontend/src/utils/ckan.js:26) dan [portal-frontend/src/pages/Publikasi.jsx](/root/baru/portal-frontend/src/pages/Publikasi.jsx:3).

- `Topik menggabungkan definisi tetap dan data CKAN`
  Bukti definisi lima topik ada di [portal-frontend/src/utils/topics.js](/root/baru/portal-frontend/src/utils/topics.js:7).
  Bukti halaman topik membaca data CKAN dan memetakannya ke definisi tetap ada di [portal-frontend/src/pages/Topik.jsx](/root/baru/portal-frontend/src/pages/Topik.jsx:2).

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

- `Pembatasan visibility dataset di CKAN`
  Bukti extension ada di [docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py:23).
  Bukti plugin diaktifkan ada di [docker-ckan/compose/config/ckan/.env](/root/baru/docker-ckan/compose/config/ckan/.env:29).
  Bukti template dropdown diubah ada di [docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/templates/package/snippets/package_basic_fields.html](/root/baru/docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/templates/package/snippets/package_basic_fields.html:1).

```python
# File: docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py
# Letak: helper pengecekan hak akses Public
def can_set_public(self, data_dict=None, context=None):
    if _check_access('sysadmin', context):
        return True

    org_id = _organization_id(data_dict)
    if not org_id:
        return False

    return _check_access(
        'organization_update',
        context,
        {'id': org_id}
    )
```

Catatan:
Kode ini mengecek apakah user boleh membuat dataset `Public`. Jika user adalah `sysadmin`, akses langsung diberikan. Jika bukan sysadmin, sistem mengambil ID organisasi dataset lalu mengecek apakah user punya hak `organization_update`, yang merepresentasikan role admin organisasi.

```python
# File: docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/plugin.py
# Letak: validasi backend create/update dataset
def package_create(self, context, data_dict):
    if not self.can_set_public(data_dict, context):
        data_dict['private'] = True
    return {'success': True}

def package_update(self, context, data_dict):
    if not self.can_set_public(data_dict, context):
        if data_dict.get('private') is False:
            return {
                'success': False,
                'msg': 'Hanya sysadmin atau admin organisasi yang boleh set Public'
            }
    return {'success': True}
```

Catatan:
Kode ini menjadi pengaman backend. Saat dataset dibuat oleh editor, nilai `private` dipaksa menjadi `True`, sehingga dataset tetap `Private`. Saat dataset diupdate, editor tidak boleh mengubah visibility menjadi `Public`. Jadi pembatasan tetap berlaku walaupun user mencoba mengirim request manual lewat API atau browser developer tools.

```html
<!-- File: docker-ckan/extensions/ckanext-restrict_visibility/ckanext/restrict_visibility/templates/package/snippets/package_basic_fields.html -->
<!-- Letak: pilihan dropdown Visibility -->
{% set visibility_options = [('True', _('Private'))] %}
{% if can_set_public %}
  {% set visibility_options = visibility_options + [('False', _('Public'))] %}
{% endif %}
```

Catatan:
Kode ini mengatur isi dropdown `Visibility` di form CKAN. Secara default pilihan yang ditampilkan hanya `Private`. Opsi `Public` baru ditambahkan jika helper `can_set_public` menyatakan user adalah sysadmin atau admin organisasi.

```env
# File: docker-ckan/compose/config/ckan/.env
# Letak: aktivasi plugin CKAN
CKAN__PLUGINS=envvars activity image_view text_view datastore datapusher datatables_view xloader example_idatasetform restrict_visibility
```

Catatan:
Baris ini mengaktifkan plugin `restrict_visibility` di CKAN. Tanpa menambahkan nama plugin di `CKAN__PLUGINS`, extension tidak akan dijalankan oleh CKAN.

```yaml
# File: docker-ckan/compose/services/ckan/ckan.yaml
# Letak: install extension sebelum CKAN start
command:
  - /bin/bash
  - -lc
  - uv pip install --system -e /app/extensions/ckanext-restrict_visibility && exec /app/start_ckan.sh
```

Catatan:
Command ini memastikan extension `ckanext-restrict_visibility` terinstall lebih dulu setiap container CKAN dijalankan. Setelah extension terinstall, CKAN baru distart melalui `/app/start_ckan.sh`. Ini mencegah error `PluginNotFoundException` saat CKAN membaca plugin dari konfigurasi.

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

Secara implementasi, sistem sudah berbentuk portal data terpadu yang berjalan di atas React + CodeIgniter 4 + CKAN dengan login admin berbasis session CKAN. Tantangan terbesarnya bukan lagi arsitektur inti, tetapi sinkronisasi dokumentasi, konsolidasi routing frontend, dan penyederhanaan logika yang saat ini masih campuran antara definisi statis frontend dan sumber data CKAN.
