# Portal Kebutuhan Data - Sistem Manajemen Data Terpadu / Unified Data Management Portal

[![CKAN](https://img.shields.io/badge/CKAN-2.10%2F2.11-brightgreen)](https://ckan.org/) [![CodeIgniter](https://img.shields.io/badge/CodeIgniter-4-blue)](https://codeigniter.com/) [![React](https://img.shields.io/badge/React-18%2B-brightblue)](https://reactjs.org/) [![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docker.com/)

## Ikhtisar / Overview
Sistem ini adalah **Portal Manajemen Data Terbuka** berbasis CKAN yang terintegrasi dengan API custom (CodeIgniter 4) dan Frontend React. Dirancang untuk mengelola, mencari, dan mempublikasikan dataset publik dengan fitur admin CRUD, autentikasi JWT, dan preview data.

**Tujuan**: Menyediakan platform satu data (System-Satu-data) untuk kebutuhan data pemerintahan/organisasi, dengan CKAN sebagai core katalog data open source.

## Arsitektur Sistem / System Architecture
```
┌─────────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Portal Frontend   │    │    Portal API     │    │     CKAN Core    │
│  (React + Vite)     │◄──►│ (CodeIgniter 4)  │◄──►│ (Data Catalog)   │
│  Port: 3000         │    │ Port: 8081       │    │  Port: 5000      │
└─────────────────────┘    └──────────────────┘    └──────────────────┘
                                    │
                                    ▼
┌─────────────────────┐    ┌──────────────────┐
│ PostgreSQL (DB)     │    │    Solr (Search) │
└─────────────────────┘    └──────────────────┘
         │                           │
         └───────────────┬───────────┘
                         ▼
                  Redis (Cache)
```

- **Flow Data**:
  1. User akses Frontend → Call API endpoints.
  2. API handle auth, proxy ke CKAN (via API CKAN internal), atau manage custom dataset.
  3. CKAN store/search data di Postgres/Solr.
  4. Datapusher handle upload/process file.

## Tech Stack
| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Data Catalog | CKAN | 2.10/2.11 (Dockerized) |
| Backend API | CodeIgniter 4 (PHP) | 4.x |
| Frontend | React + Vite + Bootstrap | React 18+, Vite 5+ |
| Database | PostgreSQL | Latest |
| Search | Apache Solr | 8.x |
| Cache | Redis | Latest |
| Orchestration | Docker Compose | Multi-service |

## Layanan / Services (docker-compose.yml)
| Service | Image/Build | Port | Deskripsi |
|---------|-------------|------|-----------|
| ckan | docker-ckan/ckan | 5000 | CKAN web app |
| ckan-worker-* | docker-ckan/ckan | - | Background jobs (default/bulk/priority) |
| db | postgres | 5432 | Data storage |
| solr | solr | 8983 | Full-text search |
| redis | redis | 6379 | Session/Cache |
| datapusher | datapusher | - | File processing |
| **portal-api** | portal-api (build) | **8081** | Custom REST API |
| **portal-frontend** | portal-frontend (build) | **3000** | React UI |

**Networks**: `frontend` (public), `backend` (internal).

## Dokumentasi API / API Documentation
Base URL: `http://localhost:8081`

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/` | Halaman home | No |
| GET | `api/datasets` | Daftar dataset | No |
| GET | `api/dataset/:id` | Detail dataset | No |
| GET | `api/search` | Pencarian dataset | No |
| GET | `api/preview/:id` | Preview dataset | No |
| POST | `api/login` | Login (return JWT) | No |
| POST | `api/admin/dataset` | Buat dataset | JWT |
| PUT | `api/admin/dataset/:id` | Update dataset | JWT |
| DELETE | `api/admin/dataset/:id` | Hapus dataset | JWT |

**Controllers Utama**:
- `HomeController`: Landing page.
- `DatasetController`: CRUD dataset.
- `AuthController`: JWT login.

## Komponen Frontend / Frontend Components
- **Pages**: Login, Admin, DatasetList, DatasetDetail.
- **Libs**: Axios (API calls), React Router, Bootstrap 5.
- `npm run dev` → http://localhost:3000

## Instalasi & Menjalankan / Installation & Running
1. Clone repo: `git clone <repo>`
2. cd `/root/baru`
3. Setup env (copy `.env` files dari `docker-ckan/compose/config/` jika perlu).
4. Jalankan: `docker compose -f docker-ckan/compose/docker-compose.yml up -d`
5. Akses:
   - Frontend: http://localhost:3000
   - API: http://localhost:8081
   - CKAN: http://localhost:5000

**Development**:
- Volumes mounted untuk hot-reload.
- API: Edit `portal-api/` → restart container.
- Frontend: `npm run dev` di container.

## Konfigurasi / Configuration
- Env files di `docker-ckan/compose/config/`.
- CKAN plugins: `envvars image_view text_view recline_view datastore datapusher`.
- CORS enabled di API (`app/Config/Cors.php`).

## Pengembangan Lanjutan / Further Development
- Tambah models/migrations di `portal-api/app/Database/`.
- Extend CKAN extensions via Dockerfile.
- Tests: PHPUnit di API (`portal-api/phpunit.xml`).

## Troubleshooting
- Logs: `docker compose logs <service>`
- DB Reset: Volume clean di `docker-ckan/compose/services/db/`.

**Screenshots** (placeholder):
- [Frontend Dashboard]()
- [Dataset Detail]()
- [Admin Panel]()

---

*Built with ❤️ for Portal Kebutuhan Data. Kontribusi welcome!*

