import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import {
  getDatasetKey,
  mergeDatasetsWithSettings,
  readDatasetSettings,
  writeDatasetSettings,
} from "../utils/datasetVisibility"

function Admin(){
  const [datasets, setDatasets] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedId, setSelectedId] = useState(null)
  const [draftNote, setDraftNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(()=>{
    const token = localStorage.getItem("token")

    if(!token){
      window.location.href = "/login"
    }
  },[])

  const loadDatasets = () => {
    setLoading(true)
    setError("")

    axios.get("http://localhost:8081/api/datasets")
      .then((res) => {
        const results = res.data.result.results || []
        const merged = mergeDatasetsWithSettings(results)
        setDatasets(merged)

        if (!selectedId && merged.length > 0) {
          setSelectedId(getDatasetKey(merged[0]))
        }
      })
      .catch(() => {
        setError("Gagal memuat dataset dari CKAN.")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    loadDatasets()
  }, [])

  const filteredDatasets = useMemo(() => {
    const keyword = search.toLowerCase()

    return datasets
      .filter((dataset) => {
        const matchesSearch = [
          dataset.title,
          dataset.name,
          dataset.notes,
          dataset.organization?.title,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword))

        if (!matchesSearch) {
          return false
        }

        if (statusFilter === "visible") {
          return dataset.adminVisible
        }

        if (statusFilter === "hidden") {
          return !dataset.adminVisible
        }

        if (statusFilter === "featured") {
          return dataset.adminFeatured
        }

        return true
      })
      .sort((left, right) => {
        if (left.adminVisible !== right.adminVisible) {
          return Number(right.adminVisible) - Number(left.adminVisible)
        }

        if (left.adminFeatured !== right.adminFeatured) {
          return Number(right.adminFeatured) - Number(left.adminFeatured)
        }

        return left.title.localeCompare(right.title)
      })
  }, [datasets, search, statusFilter])

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => getDatasetKey(dataset) === selectedId) || null,
    [datasets, selectedId],
  )

  useEffect(() => {
    setDraftNote(selectedDataset?.adminNote || "")
  }, [selectedDataset])

  const updateDatasetSetting = (datasetId, changes) => {
    const settings = readDatasetSettings()
    const current = settings[datasetId] || {}

    settings[datasetId] = {
      ...current,
      ...changes,
      updatedAt: new Date().toISOString(),
    }

    writeDatasetSettings(settings)

    setDatasets((currentDatasets) =>
      currentDatasets.map((dataset) => {
        if (getDatasetKey(dataset) !== datasetId) {
          return dataset
        }

        return {
          ...dataset,
          adminVisible: settings[datasetId].visible ?? dataset.adminVisible,
          adminFeatured: settings[datasetId].featured ?? dataset.adminFeatured,
          adminNote: settings[datasetId].note ?? dataset.adminNote,
          adminUpdatedAt: settings[datasetId].updatedAt,
        }
      }),
    )

    window.dispatchEvent(new Event("portal-admin-settings-updated"))
  }

  const toggleVisibility = (datasetId, currentValue) => {
    updateDatasetSetting(datasetId, { visible: !currentValue })
  }

  const toggleFeatured = (datasetId, currentValue) => {
    updateDatasetSetting(datasetId, { featured: !currentValue })
  }

  const saveNote = () => {
    if (!selectedDataset) {
      return
    }

    updateDatasetSetting(getDatasetKey(selectedDataset), { note: draftNote })
  }

  const stats = useMemo(() => {
    const total = datasets.length
    const visible = datasets.filter((dataset) => dataset.adminVisible).length
    const hidden = total - visible
    const featured = datasets.filter((dataset) => dataset.adminFeatured).length

    return { total, visible, hidden, featured }
  }, [datasets])

  return(
    <div className="admin-dashboard">
      <div className="admin-hero">
        <div>
          <div className="admin-kicker">Portal Frontend Admin</div>
          <h1>Dashboard Data Management System</h1>
          <p>
            Kelola dataset CKAN yang ingin ditampilkan di portal, tandai sebagai
            unggulan, dan simpan catatan editorial untuk tim admin.
          </p>
        </div>

        <div className="admin-hero__actions">
          <a href="/" className="btn btn-outline-dark">Lihat Portal</a>
          <button className="btn btn-dark" onClick={loadDatasets}>
            Sinkronkan Dataset
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span>Total</span>
          <strong>{stats.total}</strong>
          <small>dataset dari CKAN</small>
        </div>
        <div className="admin-stat-card">
          <span>Tampil</span>
          <strong>{stats.visible}</strong>
          <small>aktif di portal</small>
        </div>
        <div className="admin-stat-card">
          <span>Tersembunyi</span>
          <strong>{stats.hidden}</strong>
          <small>disembunyikan admin</small>
        </div>
        <div className="admin-stat-card">
          <span>Unggulan</span>
          <strong>{stats.featured}</strong>
          <small>diprioritaskan di beranda</small>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="form-control"
          placeholder="Cari judul dataset, slug, organisasi..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="form-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">Semua Status</option>
          <option value="visible">Hanya Tampil</option>
          <option value="hidden">Hanya Tersembunyi</option>
          <option value="featured">Hanya Unggulan</option>
        </select>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-grid">
        <div className="admin-panel">
          <div className="admin-panel__header">
            <div>
              <h2>Daftar Dataset</h2>
              <p>{filteredDatasets.length} dataset sesuai filter</p>
            </div>
          </div>

          {loading ? (
            <div className="admin-empty">Memuat dataset dari CKAN...</div>
          ) : filteredDatasets.length === 0 ? (
            <div className="admin-empty">Tidak ada dataset yang cocok dengan filter saat ini.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="table admin-table align-middle">
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>Status</th>
                    <th>Unggulan</th>
                    <th>Resource</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDatasets.map((dataset) => {
                    const datasetId = getDatasetKey(dataset)

                    return (
                      <tr
                        key={datasetId}
                        className={datasetId === selectedId ? "admin-row-selected" : ""}
                        onClick={() => setSelectedId(datasetId)}
                      >
                        <td>
                          <div className="admin-dataset-title">{dataset.title}</div>
                          <div className="admin-dataset-subtitle">
                            {dataset.name} · {dataset.organization?.title || "Tanpa organisasi"}
                          </div>
                        </td>
                        <td>
                          <span className={`admin-badge ${dataset.adminVisible ? "is-visible" : "is-hidden"}`}>
                            {dataset.adminVisible ? "Tampil" : "Tersembunyi"}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge ${dataset.adminFeatured ? "is-featured" : ""}`}>
                            {dataset.adminFeatured ? "Ya" : "Tidak"}
                          </span>
                        </td>
                        <td>{dataset.num_resources}</td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="btn btn-sm btn-outline-dark"
                              onClick={(event) => {
                                event.stopPropagation()
                                toggleVisibility(datasetId, dataset.adminVisible)
                              }}
                            >
                              {dataset.adminVisible ? "Sembunyikan" : "Tampilkan"}
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={(event) => {
                                event.stopPropagation()
                                toggleFeatured(datasetId, dataset.adminFeatured)
                              }}
                            >
                              {dataset.adminFeatured ? "Batalkan Unggulan" : "Jadikan Unggulan"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-panel admin-panel--detail">
          <div className="admin-panel__header">
            <div>
              <h2>Detail Manajemen</h2>
              <p>Atur status tampil, unggulan, dan catatan editorial.</p>
            </div>
          </div>

          {!selectedDataset ? (
            <div className="admin-empty">Pilih dataset untuk melihat detail pengelolaannya.</div>
          ) : (
            <div className="admin-detail">
              <div className="admin-detail__headline">
                <div>
                  <h3>{selectedDataset.title}</h3>
                  <p>{selectedDataset.name}</p>
                </div>
                <div className="admin-detail__badges">
                  <span className={`admin-badge ${selectedDataset.adminVisible ? "is-visible" : "is-hidden"}`}>
                    {selectedDataset.adminVisible ? "Tampil di Portal" : "Disembunyikan"}
                  </span>
                  {selectedDataset.adminFeatured && (
                    <span className="admin-badge is-featured">Unggulan</span>
                  )}
                </div>
              </div>

              <p className="admin-detail__description">
                {selectedDataset.notes || "Dataset ini belum memiliki deskripsi dari CKAN."}
              </p>

              <div className="admin-detail__meta">
                <div>
                  <span>Organisasi</span>
                  <strong>{selectedDataset.organization?.title || "Tanpa organisasi"}</strong>
                </div>
                <div>
                  <span>Jumlah Resource</span>
                  <strong>{selectedDataset.num_resources}</strong>
                </div>
                <div>
                  <span>Pembaruan Admin</span>
                  <strong>{selectedDataset.adminUpdatedAt || "-"}</strong>
                </div>
              </div>

              <div className="admin-detail__buttons">
                <button
                  className={`btn ${selectedDataset.adminVisible ? "btn-outline-dark" : "btn-dark"}`}
                  onClick={() => toggleVisibility(getDatasetKey(selectedDataset), selectedDataset.adminVisible)}
                >
                  {selectedDataset.adminVisible ? "Jangan Tampilkan" : "Tampilkan di Portal"}
                </button>
                <button
                  className={`btn ${selectedDataset.adminFeatured ? "btn-outline-warning" : "btn-warning"}`}
                  onClick={() => toggleFeatured(getDatasetKey(selectedDataset), selectedDataset.adminFeatured)}
                >
                  {selectedDataset.adminFeatured ? "Batalkan Status Unggulan" : "Tandai Sebagai Unggulan"}
                </button>
              </div>

              <div className="admin-note-box">
                <label className="form-label">Catatan Admin</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                  placeholder="Contoh: tampilkan di homepage minggu ini, butuh verifikasi metadata, atau prioritaskan untuk kategori pendidikan."
                />
                <button className="btn btn-dark mt-3" onClick={saveNote}>
                  Simpan Catatan
                </button>
              </div>

              <div className="admin-resource-list">
                <h4>Daftar Resource</h4>
                {selectedDataset.resources?.length ? (
                  selectedDataset.resources.map((resource) => (
                    <div className="admin-resource-item" key={resource.id}>
                      <div>
                        <strong>{resource.name || "Resource tanpa nama"}</strong>
                        <p>{resource.format || "Format tidak diketahui"}</p>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-dark"
                      >
                        Buka
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="mb-0">Dataset ini belum memiliki resource.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin
