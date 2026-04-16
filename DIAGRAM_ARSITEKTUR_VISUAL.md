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
  ├─ Auth controller -> login admin
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
Home / Organisasi / Topik / Search
          │
          ▼
portal-frontend/src/utils/ckan.js
          │
          ▼
/api/datasets | /api/organizations | /api/search | /api/preview/:id
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
   ├─ readPublications()
   ├─ sortPublications()
   └─ filter category/year/title
   │
   ▼
Local storage browser
```

Catatan:
- publikasi belum diambil dari backend,
- data dan lampiran masih dikelola di sisi frontend/admin flow.

## Diagram 5: Visitor Counter

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

