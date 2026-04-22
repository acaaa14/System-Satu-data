# Diagram Arsitektur Visual

## Diagram 1: Gambaran Umum

```text
Browser
  │
  │ request halaman publik
  ▼
CodeIgniter 4
  ├─ Frontend::index  -> kirim build React
  ├─ Dataset controller -> proxy ke CKAN
  ├─ Auth controller -> sinkronisasi login CKAN
  └─ Visitor controller -> counter pengunjung
  │
  │ request data
  ▼
CKAN API
  │
  ├─ package_search
  ├─ package_show
  ├─ organization_list
  └─ datastore_search
  │
  ▼
PostgreSQL / Solr / Redis / Datapusher
```

## Diagram 2: Frontend Route Flow

```text
User
  │
  ├─ /
  ├─ /organisasi
  ├─ /publikasi
  ├─ /topik
  ├─ /pencarian
  ├─ /login
  └─ /admin
          │
          ▼
  portal-api/app/Config/Routes.php
          │
          ▼
     Frontend::index
          │
          ▼
 public/frontend/index.html
          │
          ▼
      React App
```

## Diagram 3: Alur Data Halaman Publik

```text
Home / Organisasi / Topik / Search / Publikasi
          │
          ▼
portal-frontend/src/utils/ckan.js
          │
          ▼
/api/datasets | /api/organizations | /api/topics | /api/publications | /api/search | /api/preview/:id
          │
          ▼
portal-api/app/Controllers/Dataset.php
          │
          ▼
CKAN API
```

## Diagram 4: Alur Publikasi

```text
Publikasi page
   │
   ├─ fetchPublications()
   ├─ map data CKAN ke tabel publikasi
   └─ filter category/year/title
   │
   ▼
GET /api/publications
   │
   ▼
Dataset::publications
   │
   ▼
CKAN package_search (group publikasi/topik)
```

Catatan:
- data publikasi utama sekarang berasal dari CKAN,
- frontend tetap merapikan format kategori, tahun, gambar, dan lampiran sebelum dirender.

## Diagram 5: Alur Topik

```text
Topik page
   │
   ├─ topicDefinitions (5 topik utama tetap)
   ├─ fetchTopics()
   └─ padankan data CKAN ke topik tetap
   │
   ▼
GET /api/topics
   │
   ▼
Dataset::topics
   │
   ▼
CKAN package_search -> ambil organisasi pemilik dataset di group topik
```

Catatan:
- lima topik utama tetap ada di UI,
- isi kartu topik mengikuti data CKAN yang cocok.

## Diagram 6: Alur Login Admin

```text
Klik Login / akses Admin tanpa token
   │
   ▼
Redirect ke CKAN_LOGIN_URL
   │
   ▼
CKAN login page
   │
   ▼
Kembali ke /login?sync=ckan
   │
   ▼
POST /api/auth/ckan/sync
   │
   ▼
Auth::syncCkanSession
   │
   ▼
JWT portal disimpan di browser
   │
   ▼
/admin
```

## Diagram 7: Visitor Counter

```text
Frontend
  │
  ├─ GET  /api/visitors
  └─ POST /api/visitors/increment
          │
          ▼
Visitor.php
          │
          ▼
portal-api/writable/analytics/visitors.sqlite3
```
