<!--
  View ini adalah landing lama berbasis PHP/Bootstrap.
  Saat ini frontend utama sudah disajikan oleh React melalui Frontend controller,
  sehingga file ini hanya tersisa sebagai referensi/backup tampilan lama.
-->
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal Data Kota Tangerang</title>
  <link
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    rel="stylesheet"
  >
  <link rel="stylesheet" href="/css/home.css">
</head>
<body>
  <div class="hero-shell">
    <div class="card hero-card">
      <div class="row g-0">
        <div class="col-lg-7">
          <section class="hero-panel">
            <span class="hero-kicker">CodeIgniter4 + React.js + Bootstrap</span>
            <h1 class="hero-title">Portal kebutuhan data yang disajikan lewat CodeIgniter4 dan diperkaya komponen React.</h1>
            <p class="hero-copy mb-4">
              Halaman utama ini dirender oleh CodeIgniter4, menggunakan Bootstrap sebagai fondasi UI,
              dan menjalankan komponen React di sisi browser agar pengalaman frontend lebih interaktif.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <a href="/api/datasets" class="btn btn-light btn-lg">Lihat API Dataset</a>
              <a href="/app" class="btn btn-outline-light btn-lg">Buka Frontend Portal</a>
            </div>
          </section>
        </div>

        <div class="col-lg-5 bg-white">
          <div class="p-4 p-lg-5">
            <div id="react-home-widget"></div>
          </div>
        </div>
      </div>
    </div>

    <section class="mt-4">
      <div class="row g-4">
        <div class="col-md-4">
          <article class="feature-card">
            <span class="feature-label">Frontend</span>
            <h2 class="h4">React.js + Bootstrap</h2>
            <p class="mb-0 text-secondary">
              Komponen interaktif dan tampilan responsif tetap tersedia untuk kebutuhan dashboard, katalog, dan pencarian.
            </p>
          </article>
        </div>
        <div class="col-md-4">
          <article class="feature-card">
            <span class="feature-label">Application Layer</span>
            <h2 class="h4">CodeIgniter4</h2>
            <p class="mb-0 text-secondary">
              Menangani routing, controller, integrasi API, autentikasi JWT, dan penyajian halaman web utama portal.
            </p>
          </article>
        </div>
        <div class="col-md-4">
          <article class="feature-card">
            <span class="feature-label">Service</span>
            <h2 class="h4">CKAN Integration</h2>
            <p class="mb-0 text-secondary">
              Dataset tetap diproses melalui CKAN sehingga katalog data, pencarian, dan preview resource tetap berjalan.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="mt-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h2 class="h4 mb-3">Endpoint utama</h2>
          <div class="row g-3 api-list">
            <div class="col-md-6">
              <div class="feature-card">
                <p class="mb-2"><code>GET /api/datasets</code></p>
                <p class="text-secondary mb-0">Mengambil daftar dataset dari CKAN melalui backend CodeIgniter4.</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="feature-card">
                <p class="mb-2"><code>GET /api/dataset/{id}</code></p>
                <p class="text-secondary mb-0">Menampilkan detail dataset berdasarkan identifier.</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="feature-card">
                <p class="mb-2"><code>GET /api/search?q=...</code></p>
                <p class="text-secondary mb-0">Pencarian dataset melalui endpoint backend yang meneruskan query ke CKAN.</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="feature-card">
                <p class="mb-2"><code>POST /api/login</code></p>
                <p class="text-secondary mb-0">Autentikasi untuk area admin menggunakan JWT.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="/js/home.js"></script>
</body>
</html>
