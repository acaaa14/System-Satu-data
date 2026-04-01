import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import { mergeDatasetsWithSettings, readDatasetSettings } from "../utils/datasetVisibility"

const cityHighlights = [
  {
    eyebrow: "Mobilitas",
    title: "Akses cepat ke data perkotaan",
    description:
      "Portal membantu pengguna menelusuri data layanan, transportasi, dan aktivitas kota secara lebih terstruktur.",
  },
  {
    eyebrow: "Ekonomi",
    title: "Informasi yang relevan untuk pengambilan keputusan",
    description:
      "Dataset unggulan disusun agar pemangku kepentingan dapat menemukan informasi prioritas dengan lebih efisien.",
  },
  {
    eyebrow: "Layanan Publik",
    title: "Tampilan yang bersih dan mudah dipahami",
    description:
      "Desain minimalis menjaga fokus pada isi data tanpa mengurangi keterbacaan dan kesan profesional.",
  },
]

function DatasetList() {
  const [datasets, setDatasets] = useState([])
  const [search, setSearch] = useState("")
  const [settingsVersion, setSettingsVersion] = useState(0)

  useEffect(() => {
    const url = search
      ? `http://localhost:8081/api/search?q=${search}`
      : "http://localhost:8081/api/datasets"

    axios
      .get(url)
      .then((res) => {
        const results = res.data.result.results || []
        const merged = mergeDatasetsWithSettings(results)
          .filter((dataset) => dataset.adminVisible)
          .sort((left, right) => Number(right.adminFeatured) - Number(left.adminFeatured))

        setDatasets(merged)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [search, settingsVersion])

  useEffect(() => {
    const syncSettings = () => {
      readDatasetSettings()
      setSettingsVersion((value) => value + 1)
    }

    window.addEventListener("storage", syncSettings)
    window.addEventListener("portal-admin-settings-updated", syncSettings)

    return () => {
      window.removeEventListener("storage", syncSettings)
      window.removeEventListener("portal-admin-settings-updated", syncSettings)
    }
  }, [])

  const featuredDatasets = useMemo(
    () => datasets.filter((dataset) => dataset.adminFeatured),
    [datasets],
  )

  const totalResources = useMemo(
    () => datasets.reduce((accumulator, dataset) => accumulator + dataset.num_resources, 0),
    [datasets],
  )

  return (
    <div className="portal-shell">
      <section className="portal-hero portal-hero--minimal">
        <div className="portal-hero__grid">
          <div className="portal-hero__content">
            <div className="portal-hero__badge">Portal Data Kota Tangerang</div>
            <h1>Portal data Kota Tangerang dengan desain minimalis dan profesional.</h1>
            <p>
              Dirancang untuk menampilkan data pemerintah secara lebih rapi, tenang, dan
              mudah ditelusuri oleh masyarakat, tim internal, maupun pemangku kepentingan.
            </p>

            <div className="portal-hero__actions">
              <input
                type="text"
                className="form-control portal-search"
                placeholder="Cari dataset prioritas, layanan, atau organisasi..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <a href="#katalog-dataset" className="btn btn-primary portal-cta">
                Jelajahi Katalog
              </a>
            </div>
          </div>

          <div className="portal-hero__summary">
            <div className="portal-stat-card portal-stat-card--hero">
              <span>Dataset Aktif</span>
              <h3>{datasets.length}</h3>
              <p>Kurasi tampil untuk publik</p>
            </div>
            <div className="portal-stat-card portal-stat-card--hero">
              <span>Unggulan Kota</span>
              <h3>{featuredDatasets.length}</h3>
              <p>Prioritas untuk spotlight</p>
            </div>
            <div className="portal-stat-card portal-stat-card--hero">
              <span>Total Resource</span>
              <h3>{totalResources}</h3>
              <p>File dan endpoint terhubung</p>
            </div>
          </div>
        </div>
      </section>

      <section className="portal-section portal-section--highlights">
        <div className="portal-section-heading">
          <div>
            <h2>Prinsip Tampilan</h2>
            <p>
              Pendekatan visual dibuat sederhana agar isi data menjadi pusat perhatian.
            </p>
          </div>
        </div>

        <div className="portal-highlight-grid">
          {cityHighlights.map((item) => (
            <article className="portal-highlight-card" key={item.title}>
              <span className="portal-highlight-card__eyebrow">{item.eyebrow}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {featuredDatasets.length > 0 && (
        <section className="portal-section">
          <div className="portal-section-heading">
            <div>
              <h2>Dataset Unggulan</h2>
              <p>Dataset prioritas yang ditampilkan lebih menonjol untuk kebutuhan eksplorasi cepat.</p>
            </div>
          </div>

          <div className="portal-featured-grid">
            {featuredDatasets.slice(0, 3).map((dataset, index) => (
              <article className="portal-featured-card" key={`featured-${dataset.id}`}>
                <div className="portal-featured-card__topline">
                  <span className="portal-chip portal-chip--featured">Unggulan {index + 1}</span>
                  <span className="portal-featured-card__meta">
                    {dataset.organization?.title || "Tanpa organisasi"}
                  </span>
                </div>
                <h3>{dataset.title}</h3>
                <p>{dataset.notes || "Dataset ini belum memiliki deskripsi singkat."}</p>
                <div className="portal-meta">
                  <span>{dataset.num_resources} resource</span>
                  <span>Siap ditelusuri</span>
                </div>
                <a href={`/dataset/${dataset.name}`} className="btn btn-dark portal-card-button">
                  Buka Dataset
                </a>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="portal-section" id="katalog-dataset">
        <div className="portal-section-heading">
          <div>
            <h2>Katalog Dataset</h2>
            <p>
              Semua dataset aktif ditampilkan dalam tata letak kartu yang bersih, konsisten,
              dan mudah dipindai.
            </p>
          </div>
        </div>

        {datasets.length === 0 ? (
          <div className="portal-empty-state">
            <h3>Belum ada dataset yang tampil</h3>
            <p>Coba ubah kata kunci pencarian atau aktifkan dataset dari dashboard admin.</p>
          </div>
        ) : (
          <div className="portal-dataset-grid">
            {datasets.map((dataset) => (
              <article className="portal-dataset-card" key={dataset.id}>
                <div className="portal-dataset-card__body">
                  <div className="portal-dataset-card__badges">
                    <span className="portal-chip">Aktif</span>
                    {dataset.adminFeatured && (
                      <span className="portal-chip portal-chip--featured">Unggulan</span>
                    )}
                  </div>

                  <h3>{dataset.title}</h3>
                  <p>{dataset.notes || "Dataset ini belum memiliki deskripsi singkat."}</p>

                  <div className="portal-meta">
                    <span>{dataset.num_resources} resource</span>
                    <span>{dataset.organization?.title || "Tanpa organisasi"}</span>
                  </div>

                  <a href={`/dataset/${dataset.name}`} className="btn btn-primary portal-card-button">
                    Lihat Detail Dataset
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default DatasetList
