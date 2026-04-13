# Portal Kebutuhan Data - Sistem Manajemen Data Terpadu / Unified Data Management Portal

[![CKAN](https://img.shields.io/badge/CKAN-2.10%2F2.11-brightgreen)](https://ckan.org/) [![CodeIgniter](https://img.shields.io/badge/CodeIgniter-4-blue)](https://codeigniter.com/) [![React](https://img.shields.io/badge/React-18%2B-brightblue)](https://reactjs.org/) [![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docker.com/)

## Ikhtisar / Overview
Sistem ini adalah **Portal Manajemen Data Terbuka** berbasis CKAN yang terintegrasi dengan stack `Frontend: React.js + CodeIgniter 4 + Bootstrap`, `Backend: CodeIgniter 4 (JWT)`, `Data Platform: CKAN`, `Database: PostgreSQL`, dan `Container: Docker`. Dirancang untuk mengelola, mencari, dan mempublikasikan dataset publik dengan fitur admin CRUD, autentikasi JWT, dan preview data.

**Tujuan**: Menyediakan platform satu data (System-Satu-data) untuk kebutuhan data pemerintahan/organisasi, dengan CKAN sebagai core katalog data open source.

## Penjelasan Sistem
Sistem ini bekerja sebagai portal data terpadu yang menghubungkan antarmuka pengguna, backend aplikasi, dan platform katalog data dalam satu alur yang saling terintegrasi.

Pada sisi pengguna, website menampilkan frontend berbasis **React.js** dengan tampilan yang diatur menggunakan **Bootstrap**. Frontend ini tidak langsung mengambil data ke CKAN, tetapi berkomunikasi terlebih dahulu dengan backend **CodeIgniter 4**.

**CodeIgniter 4** memiliki dua peran utama dalam sistem ini. Pertama, CodeIgniter 4 menyajikan halaman HTML ke browser. Kedua, CodeIgniter 4 bertindak sebagai backend API yang menangani autentikasi JWT, mengatur request dari frontend, lalu meneruskan pengambilan data ke **CKAN**.

**CKAN** berfungsi sebagai platform data utama yang menyimpan metadata dataset, menyediakan pencarian, detail dataset, dan preview resource. Dalam operasionalnya, CKAN didukung oleh **PostgreSQL** sebagai database utama, serta layanan pendukung seperti Solr, Redis, dan Datapusher.

### Alur Sistem
1. User membuka website melalui browser.
2. CodeIgniter 4 menyajikan halaman HTML ke browser.
3. React berjalan di browser dan membangun antarmuka interaktif.
4. React mengirim request API ke CodeIgniter 4.
5. CodeIgniter 4 mengambil atau meneruskan data dari CKAN.
6. Data dikembalikan ke frontend dan ditampilkan ke user.

## Arsitektur Sistem / System Architecture
```
┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────┐
│ Frontend Layer           │    │ Backend Rendering + API  │    │  Data Platform   │
│ React.js + Bootstrap     │◄──►│ CodeIgniter 4 + JWT      │◄──►│ CKAN             │
│ CI4 Menyajikan HTML      │    │ Ambil API dari CKAN      │    │ Port: 5000       │
│ Frontend ke Browser      │    │ Port: 8081               │    └──────────────────┘
└──────────────────────────┘    └──────────────────────────┘             │
                  │                                        ┌─────────────┴─────────────┐
                  └───────────────────────────────────────►│ PostgreSQL + Solr + Redis │
                                                           └───────────────────────────┘
```

- **Flow Data**:
  1. User membuka halaman yang dirender CodeIgniter 4 di browser.
  2. React.js menjalankan komponen interaktif pada halaman frontend.
  3. Bootstrap mengatur warna, tombol, grid, dan tata letak antarmuka.
  4. CodeIgniter 4 backend menangani JWT dan mengambil data dari API CKAN.
  5. CKAN menyimpan dan mengindeks data menggunakan PostgreSQL, Solr, Redis, dan Datapusher.

## Tech Stack
| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Frontend | React.js + CodeIgniter 4 + Bootstrap | React 19 + Bootstrap 5 + CI4 renderer |
| Backend | CodeIgniter 4 (JWT) | 4.x |
| Data Platform | CKAN | 2.10/2.11 |
| Database | PostgreSQL | Latest |
| Container | Docker | Docker Compose multi-service |

## Peran Teknologi
- **Bootstrap**: mengatur warna, tombol, grid, spacing, dan tata letak halaman.
- **CodeIgniter 4**: menyajikan halaman HTML ke browser, menyediakan endpoint JWT, dan menjadi perantara ke API CKAN.

## Layanan / Services (docker-compose.yml)
| Service | Image/Build | Port | Deskripsi |
|---------|-------------|------|-----------|
| ckan | docker-ckan/ckan | 5000 | CKAN web app |
| ckan-worker-* | docker-ckan/ckan | - | Background jobs (default/bulk/priority) |
| db | postgres | 5432 | Data storage |
| solr | solr | 8983 | Full-text search |
| redis | redis | 6379 | Session/Cache |
| datapusher | datapusher | - | File processing |
| **portal-api** | portal-api (build) | **8081** | CodeIgniter 4 renderer + JWT API + CKAN proxy |
| **portal-frontend** | portal-frontend (build) | **3000** | React frontend development only (`profile: dev-frontend`) |

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
- **Renderer**: CodeIgniter 4 menyajikan halaman HTML utama ke browser.

## Instalasi & Menjalankan / Installation & Running
1. Clone repo: `git clone <repo>`
2. cd `/root/baru`
3. Setup env (copy `.env` files dari `docker-ckan/compose/config/` jika perlu).
4. Jalankan: `docker compose -f docker-ckan/compose/docker-compose.yml up -d`
5. Akses:
   - Frontend utama (CodeIgniter renderer): http://localhost:8081
   - Frontend portal production (React via CodeIgniter): http://localhost:8081/app
   - API backend: http://localhost:8081/api
   - CKAN: http://localhost:5000

**Development**:
- Volumes mounted untuk hot-reload.
- API: Edit `portal-api/` → restart container.
- Frontend production build ke CodeIgniter: `cd portal-frontend && npm run build:portal`
- Frontend React dev server hanya berjalan jika profile diaktifkan:
  `docker compose -f docker-ckan/compose/docker-compose.yml --profile dev-frontend up -d`

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
