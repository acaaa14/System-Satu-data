# 🎨 DIAGRAM ARSITEKTUR SISTEM

## Diagram 1: System Architecture Overview

Catatan alignment stack:
- Frontend: React.js + CodeIgniter 4 + Bootstrap
- Backend: CodeIgniter 4 (JWT) untuk mengambil API dari CKAN
- Data Platform: CKAN
- Database: PostgreSQL
- Container: Docker
- Bootstrap mengatur warna, tombol, dan tata letak
- CodeIgniter 4 merender halaman HTML ke browser

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PORTAL MANAJEMEN DATA TERPADU                     │
│                                                                           │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃                      LAYER 1: FRONTEND LAYER                     ┃ │
│  ┃  ┌──────────────────────────────────────────────────────────┐  ┃ │
│  ┃  │  React.js (v19) + React Router                          │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Components:                                            │  ┃ │
│  ┃  │  • DatasetList      (List semua dataset)               │  ┃ │
│  ┃  │  • DatasetDetail    (Detail & preview)                │  ┃ │
│  ┃  │  • Login            (User login form)                  │  ┃ │
│  ┃  │  • Admin Panel      (Manage dataset)                   │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Styling: Bootstrap 5.3.8                              │  ┃ │
│  ┃  │  HTTP Client: Axios                                    │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  React build disajikan oleh CodeIgniter 4             │  ┃ │
│  ┃  └──────────────────────────────────────────────────────────┘  ┃ │
│  ┃              frontend production via CodeIgniter                 ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                   │                                     │
│                    HTTP Requests (Axios)                                │
│                         API Calls                                       │
│                                   │                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃           LAYER 2: HTML RENDERING + BACKEND API LAYER           ┃ │
│  ┃  ┌──────────────────────────────────────────────────────────┐  ┃ │
│  ┃  │          CodeIgniter 4 (PHP 8.2 + Apache)               │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Route GET /                                            │  ┃ │
│  ┃  │  └─> Home::index()                                      │  ┃ │
│  ┃  │      └─> view('home.php')  ✅ HTML RENDERING            │  ┃ │
│  ┃  │          • Bootstrap CSS imported                       │  ┃ │
│  ┃  │          • HTML dirender ke browser                    │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  REST API Routes:                                       │  ┃ │
│  ┃  │  ├─ GET  /api/datasets                                 │  ┃ │
│  ┃  │  ├─ GET  /api/dataset/:id                              │  ┃ │
│  ┃  │  ├─ GET  /api/search?q=...                             │  ┃ │
│  ┃  │  ├─ GET  /api/preview/:id                              │  ┃ │
│  ┃  │  ├─ POST /api/login           (→ JWT Token)            │  ┃ │
│  ┃  │  ├─ POST /api/admin/dataset   (✅ JWT Filter)          │  ┃ │
│  ┃  │  ├─ PUT  /api/admin/dataset   (✅ JWT Filter)          │  ┃ │
│  ┃  │  └─ DEL  /api/admin/dataset   (✅ JWT Filter)          │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Controllers:                                           │  ┃ │
│  ┃  │  • Auth.php       (JWT login & token generation)       │  ┃ │
│  ┃  │  • Dataset.php    (CKAN proxy + business logic)        │  ┃ │
│  ┃  │  • Home.php       (HTML rendering)                     │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Authentication: Firebase PHP-JWT v7.0                 │  ┃ │
│  ┃  │  • Encode token dengan HS256                           │  ┃ │
│  ┃  │  • Verify token di API routes protected                │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  └──────────────────────────────────────────────────────────┘  ┃ │
│  ┃              localhost:80 / localhost (Port 80)                   ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▲━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                   │                                     │
│                    Curl Requests (requestCkan)                          │
│                    Forward ke CKAN API                                  │
│                                   │                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃       LAYER 3: DATA PLATFORM - CKAN (Data Catalog)             ┃ │
│  ┃  ┌──────────────────────────────────────────────────────────┐  ┃ │
│  ┃  │  CKAN API (http://ckan:5000/api/3/action)               │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Endpoints:                                             │  ┃ │
│  ┃  │  • /package_search      (List dataset)                 │  ┃ │
│  ┃  │  • /package_show        (Detail dataset)               │  ┃ │
│  ┃  │  • /datastore_search    (Preview data)                 │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  └──────────────────────────────────────────────────────────┘  ┃ │
│  ┃     Orkestrasi: Docker Compose (ckan:5000)                      ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▲━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                   │                                     │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▼━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃       LAYER 4: DATA STORAGE & SUPPORT SERVICES                 ┃ │
│  ┃  ┌──────────────────────────────────────────────────────────┐  ┃ │
│  ┃  │  Database: PostgreSQL                                   │  ┃ │
│  ┃  │  • Menyimpan metadata dataset                           │  ┃ │
│  ┃  │  • CKAN tables: package, resource, datastore           │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Search Engine: Solr                                    │  ┃ │
│  ┃  │  • Indexing dataset untuk pencarian cepat              │  ┃ │
│  ┃  │  • Full-text search capability                         │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Cache: Redis                                           │  ┃ │
│  ┃  │  • Caching CKAN results                                │  ┃ │
│  ┃  │  • Session management                                  │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  │  Data Processing: Datapusher                            │  ┃ │
│  ┃  │  • Preprocessing data sebelum indexing                 │  ┃ │
│  ┃  │  • Transform data format                               │  ┃ │
│  ┃  │                                                          │  ┃ │
│  ┃  └──────────────────────────────────────────────────────────┘  ┃ │
│  ┃  Orkestrasi: Docker Compose (services terisolasi)              ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 2: Request Flow Sequence

### Flow 1: User Browsing Dataset (Read)

```
┌─────────┐       ┌──────────────┐       ┌─────────────┐       ┌───────┐
│ Browser │       │ CodeIgniter  │       │   CKAN      │       │  DB   │
│(React)  │       │   API        │       │  (Solr)     │       │(PG)   │
└────┬────┘       └──────┬───────┘       └──────┬──────┘       └───┬───┘
     │                   │                      │                   │
     │ 1. GET /api/dataset                       │                   │
     ├──────────────────>│                       │                   │
     │                   │                       │                   │
     │                   │ 2. GET /api/3/action/package_show?id=xxx │
     │                   ├──────────────────────>│                   │
     │                   │                       │                   │
     │                   │                       │ 3. Query dataset metadata
     │                   │                       ├──────────────────>│
     │                   │                       │<──────────────────┤
     │                   │                       │                   │
     │                   │<──────────────────────┤ 4. Return data    │
     │<──────────────────┤                       │                   │
     │ 5. JSON response  │                       │                   │
     │                   │                       │                   │
     │ 6. React render dengan Bootstrap styling  │                   │
     │ (Colors, buttons, layout)                 │                   │
     │                   │                       │                   │
```

### Flow 2: Admin Login & Authorization (Write)

```
┌─────────┐       ┌──────────────┐       ┌─────────────┐       ┌───────┐
│ Browser │       │ CodeIgniter  │       │   CKAN      │       │  DB   │
│(React)  │       │   API        │       │ (Datapusher)│       │(PG)   │
└────┬────┘       └──────┬───────┘       └──────┬──────┘       └───┬───┘
     │                   │                      │                   │
     │ 1. POST /api/login {username, password}  │                   │
     ├──────────────────>│                       │                   │
     │                   │                       │                   │
     │                   │ 2. Validate credentials                   │
     │                   │    Generate JWT token                    │
     │                   │    (exp: 3600 seconds, algo: HS256)     │
     │                   │                       │                   │
     │<──────────────────┤ 3. Return {token: "..."}                 │
     │ 4. Save token in localStorage             │                   │
     │    Set Authorization header               │                   │
     │                   │                       │                   │
     │ 5. POST /api/admin/dataset  (+ JWT in header)                │
     ├──────────────────>│                       │                   │
     │                   │ 6. Verify JWT filter  │                   │
     │                   │ (Check exp, signature)│                   │
     │                   │                       │                   │
     │                   │ 7. POST /api/3/action/package_create      │
     │                   ├──────────────────────>│                   │
     │                   │                       │ 8. Datapusher process data
     │                   │                       │ 9. Store in PostgreSQL
     │                   │                       ├──────────────────>│
     │                   │                       │<──────────────────┤
     │                   │                       │                   │
     │                   │ 10. Solr reindex       │                   │
     │                   │<──────────────────────┤                   │
     │                   │                       │                   │
     │<──────────────────┤ 11. Success response  │                   │
     │ 12. Update UI     │                       │                   │
```

---

## Diagram 3: Technology Stack

```
┌────────────────────────────────────────────────────────────────────┐
│                    PORTAL DATA TERPADU                             │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  FRONTEND LAYER                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┤ │
│  │  │ React 19.2   │  │ Bootstrap    │  │ CodeIgniter 4      │ │
│  │  │ • Routing    │  │ 5.3.8        │  │ • Hot reload       │ │
│  │  │ • Components │  │ • Colors     │  │ • Asset bundling   │ │
│  │  │ • State      │  │ • Buttons    │  │                    │ │
│  │  │ • API calls  │  │ • Layout     │  │ NodeJS + npm       │ │
│  │  └──────────────┘  │ • Typography │  │ dependency mgmt    │ │
│  │  via browser        └──────────────┘  └────────────────────┤ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             ↕  (HTTP)                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │          RENDERING + API BACKEND LAYER                      │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │     CodeIgniter 4 (PHP 8.2 + Apache)                │  │ │
│  │  │  ┌────────────────┐  ┌──────────────────────────┐   │  │ │
│  │  │  │ HTML Rendering │  │  REST API Controllers   │   │  │ │
│  │  │  │ view('home.php')  │  • Auth.php (JWT)       │   │  │ │
│  │  │  │ Bootstrap UI   │  │  • Dataset.php (CKAN)  │   │  │ │
│  │  │  │ Browser output │  │  • Home.php (render)   │   │  │ │
│  │  │  └────────────────┘  │  • CORS handling        │   │  │ │
│  │  │                       └──────────────────────────┘   │  │ │
│  │  │  ┌──────────────┐  ┌──────────────────────────┐     │  │ │
│  │  │  │ JWT Auth     │  │  CKAN Integration        │     │  │ │
│  │  │  │ Firebase JWT │  │  • requestCkan()        │     │  │ │
│  │  │  │ • Encode     │  │  • Curl requests        │     │  │ │
│  │  │  │ • Verify     │  │  • Proxy API calls      │     │  │ │
│  │  │  │ • Expiry     │  │  • Business logic       │     │  │ │
│  │  │  └──────────────┘  └──────────────────────────┘     │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │  localhost:80                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             ↕  (Curl)                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │            DATA PLATFORM - CKAN LAYER                       │ │
│  │  ┌────────────────────────────────────────────────────────┐ │ │
│  │  │        CKAN API (ckan:5000/api/3/action)               │ │ │
│  │  │  • package_search (list dataset)                       │ │ │
│  │  │  • package_show (detail dataset)                       │ │ │
│  │  │  • datastore_search (preview & query)                  │ │ │
│  │  │  • package_create/update/delete (admin)                │ │ │
│  │  └────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                             ↕  (SQL)                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         DATA STORAGE & SUPPORT SERVICES LAYER               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │ │
│  │  │ PostgreSQL   │  │    Solr      │  │    Redis     │      │ │
│  │  │ • Metadata   │  │ • Indexing   │  │ • Caching    │      │ │
│  │  │ • Datasets   │  │ • Search     │  │ • Session    │      │ │
│  │  │ • Resources  │  │ • Query opt  │  │              │      │ │
│  │  │              │  │              │  │              │      │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────┐      │ │
│  │  │ Datapusher: Data Processing & Transformation     │      │ │
│  │  │ • CSV to Datastore conversion                    │      │ │
│  │  │ • Data format detection                          │      │ │
│  │  │ • Background job processing                      │      │ │
│  │  └──────────────────────────────────────────────────┘      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  Docker Compose (Orchestration)                                 │
└────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 4: Docker Container Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                      Docker Compose Network                         │
│                                                                    │
│  Container 1          Container 2          Container 3             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   CKAN       │    │    DB        │    │    Solr      │         │
│  │              │    │  (postgres)  │    │              │         │
│  │ port:5000    │    │ port:5432    │    │ port:8983    │         │
│  │              │    │              │    │              │         │
│  │ Metadata     │    │ Relations:   │    │ search index │         │
│  │ management   │◄──►│ • package    │◄──►│ (fast find)  │         │
│  │ & API        │    │ • resource   │    │              │         │
│  │              │    │ • datastore  │    │              │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│                                                                    │
│  Container 4          Container 5          Container 6             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   Redis      │    │  Datapusher  │    │  CKAN worker │         │
│  │              │    │              │    │  (beat)      │         │
│  │ port:6379    │    │ port:8000    │    │              │         │
│  │              │    │              │    │ Job queue    │         │
│  │ Session &    │    │ Data process │    │ processing   │         │
│  │ Caching      │    │ & upload     │    │              │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│                                                                    │
│  Container 7          Container 8                                  │
│  ┌──────────────┐    ┌──────────────┐                             │
│  │ portal-api   │    │ portal-fe    │                             │
│  │              │    │              │                             │
│  │ port:80      │    │ frontend build │                             │
│  │ (Apache)     │    │ static asset   │                             │
│  │              │    │              │                             │
│  │ CodeIgniter  │    │   React      │                             │
│  │ PHP App      │    │   React      │                             │
│  └──────────────┘    └──────────────┘                             │
│        ◄──────────────────────────►  HTTP Communication           │
│                                                                    │
│  All containers connected via internal network bridge             │
│  Each container isolated & independent                            │
│  Easy scaling: dapat add lebih banyak workers                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 5: API Endpoint Matrix

```
┌──────────────────────────────────────────────────────────────────────┐
│                     API ENDPOINT REFERENCE                            │
│                         (CodeIgniter 4)                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  PUBLIC ENDPOINTS (No Authentication Required)                       │
│  ────────────────────────────────────────────────────────────────    │
│                                                                        │
│  Route: GET /                                                         │
│  Handler: Home::index()                                               │
│  Response: HTML (home.php) dengan Bootstrap styling                  │
│  Purpose: Entry point aplikasi                                        │
│                                                                        │
│  Route: GET /api/datasets                                             │
│  Handler: Dataset::index()                                            │
│  Request: -                                                           │
│  Response: JSON { result: {packages: [...]} }                        │
│  Purpose: Daftar semua dataset dari CKAN                             │
│  Backend: curl → http://ckan:5000/api/3/action/package_search      │
│                                                                        │
│  Route: GET /api/dataset/:id                                          │
│  Handler: Dataset::show($id)                                          │
│  Request: {id: string}                                                │
│  Response: JSON { result: {name, title, resources, ...} }           │
│  Purpose: Detail dataset + metadata                                   │
│  Backend: curl → http://ckan:5000/api/3/action/package_show?id=xxx │
│                                                                        │
│  Route: GET /api/search?q=keyword                                     │
│  Handler: Dataset::search()                                           │
│  Request: {q: string}                                                 │
│  Response: JSON { result: {packages: [...]}, ...}                    │
│  Purpose: Pencarian dataset by keyword                                │
│  Backend: Solr full-text search via CKAN                            │
│                                                                        │
│  Route: GET /api/preview/:resourceId                                  │
│  Handler: Dataset::preview($resourceId)                               │
│  Request: {resourceId: string}                                        │
│  Response: JSON { result: {records: [...], ...} }                    │
│  Purpose: Preview data dalam resource (max 20 rows)                 │
│  Backend: curl → http://ckan:5000/api/3/action/datastore_search    │
│                                                                        │
│  Route: POST /api/login                                               │
│  Handler: Auth::login()                                               │
│  Request: {username: string, password: string}                       │
│  Response: JSON { status: "success", token: "eyJ..." }              │
│  Purpose: Authenticate user & generate JWT token                     │
│  Token: Berlaku 3600 detik (1 jam), algo HS256                      │
│  Backend: Firebase\JWT\JWT::encode()                                │
│                                                                        │
│  PROTECTED ENDPOINTS (Requires JWT Token)                            │
│  ────────────────────────────────────────────────────────────────    │
│                                                                        │
│  Route: POST /api/admin/dataset  [filter: jwt]                       │
│  Handler: Dataset::create()                                           │
│  Request: {name, title, notes, tags, ...} + JWT in header           │
│  Response: JSON { success: true, result: {...} }                    │
│  Purpose: Create new dataset                                          │
│  Security: JWT filter validates token before execution              │
│  Backend: curl → http://ckan:5000/api/3/action/package_create      │
│                                                                        │
│  Route: PUT /api/admin/dataset/:id  [filter: jwt]                    │
│  Handler: Dataset::update($id)                                        │
│  Request: {id, name, title, ...} + JWT in header                    │
│  Response: JSON { success: true, result: {...} }                    │
│  Purpose: Update existing dataset                                     │
│  Security: JWT filter validates token before execution              │
│  Backend: curl → http://ckan:5000/api/3/action/package_patch       │
│                                                                        │
│  Route: DELETE /api/admin/dataset/:id  [filter: jwt]                 │
│  Handler: Dataset::delete($id)                                        │
│  Request: {id} + JWT in header                                       │
│  Response: JSON { success: true }                                    │
│  Purpose: Delete dataset                                              │
│  Security: JWT filter validates token before execution              │
│  Backend: curl → http://ckan:5000/api/3/action/package_delete      │
│                                                                        │
│  CORS HANDLING                                                        │
│  ────────────────────────────────────────────────────────────────    │
│                                                                        │
│  Route: OPTIONS (:any)                                                │
│  Handler: Response 200 OK                                             │
│  Purpose: Preflight request handling untuk CORS                      │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Diagram 6: Bootstrap Integration Points

```
┌────────────────────────────────────────────────────────────────────┐
│                   BOOTSTRAP USAGE DALAM SISTEM                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ 1. DALAM CODEIGNITER VIEW (HTML Rendering)                       │
│    ──────────────────────────────────────────────────────────    │
│                                                                    │
│    File: /portal-api/app/Views/home.php                          │
│    ──────────────────────────────────────────────────────────    │
│    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2...  │
│                                                                    │
│    Bootstrap Classes Used:                                        │
│    • container      → Layout container dengan max-width           │
│    • mt-5           → Margin-top spacing                          │
│    • text-center    → Center text alignment                       │
│    • h1             → Large heading styling                       │
│    • p              → Paragraph default styling                   │
│    • btn btn-primary → Button styling (warna biru, padding)      │
│                                                                    │
│    Visual Result:                                                 │
│    ┌─────────────────────────────────────────────┐               │
│    │          Portal Data Kota Tangerang         │  (h1)         │
│    │                                             │               │
│    │    Halaman ini dirender oleh CI4            │  (p)          │
│    │                                             │               │
│    │        [Masuk ke Portal React]              │  (btn)        │
│    │        (warna biru, padding)                │               │
│    └─────────────────────────────────────────────┘               │
│                                                                    │
│                                                                    │
│ 2. DALAM REACT COMPONENTS (Styling Interaktif)                  │
│    ──────────────────────────────────────────────────────────    │
│                                                                    │
│    Dependency: bootstrap@5.3.8 di npm                            │
│    Import: import 'bootstrap/dist/css/bootstrap.min.css'         │
│    (Biasa di main.jsx atau App.jsx)                             │
│                                                                    │
│    Bootstrap Classes Likely Used:                                │
│                                                                    │
│    Navigation & Layout:                                          │
│    • navbar, navbar-expand, container-fluid  → Top navigation    │
│    • row, col-md-*, col-lg-*                 → Grid layout       │
│    • d-flex, justify-content-*, align-items  → Flexbox          │
│                                                                    │
│    Cards & Content:                                              │
│    • card, card-header, card-body             → Content box      │
│    • card-title, card-text                    → Text styling     │
│    • img-fluid                                → Responsive img   │
│                                                                    │
│    Form & Input:                                                 │
│    • form-control, form-label                 → Input styling    │
│    • mb-3, mx-auto                            → Spacing          │
│    • invalid-feedback                         → Error messaging  │
│                                                                    │
│    Buttons & Colors:                                             │
│    • btn btn-primary, btn-secondary, btn-danger  → Buttons      │
│    • btn-sm, btn-lg, btn-block                → Button sizes    │
│    • text-danger, text-success, text-warning  → Text colors     │
│    • bg-light, bg-dark                        → Background       │
│                                                                    │
│    Utilities:                                                    │
│    • mt-*, mb-*, mk-*                         → Margin spacing   │
│    • pt-*, pb-*, px-*                         → Padding spacing  │
│    • text-center, text-right, text-left       → Alignment       │
│    • visually-hidden, d-none                  → Visibility       │
│                                                                    │
│                                                                    │
│ 3. BOOTSTRAP FEATURES UTILIZED                                   │
│    ──────────────────────────────────────────────────────────    │
│                                                                    │
│    ✓ Responsive Grid System (12-column)                         │
│      → DatasetList tampil dalam grid responsive                 │
│      → Collapse ke 1-column di mobile                           │
│                                                                    │
│    ✓ Color Palette                                              │
│      → Primary (biru): CTA buttons, links                       │
│      → Success (hijau): Success messages                        │
│      → Danger (merah): Error messages, delete buttons           │
│      → Secondary (abu): Inactive/secondary actions              │
│                                                                    │
│    ✓ Typography                                                 │
│      → h1-h6 for headings                                       │
│      → .lead for prominent text                                 │
│      → Consistent font sizing & weights                         │
│                                                                    │
│    ✓ Component Styling                                          │
│      → Cards, badges, alerts                                    │
│      → Form controls, checkboxes, radios                        │
│      → Dropdown menus, modals                                   │
│      → Navbars, breadcrumbs                                     │
│                                                                    │
│    ✓ Utility Classes                                            │
│      → Flexbox utilities                                        │
│      → Spacing (margin & padding)                               │
│      → Display & visibility                                     │
│      → Text utilities                                           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

**Catatan:** Diagram ini siap digunakan untuk presentasi dan interview. 
Semua diagram menunjukkan alignment lengkap dengan requirement perusahaan! 🎯
