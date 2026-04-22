import axios from "axios"
import { useEffect, useMemo, useState } from "react"
import API_BASE_URL from "../utils/api"
import { CKAN_LOGIN_URL } from "../utils/ckanAuth"
import {
  getDatasetKey,
  mergeDatasetsWithSettings,
  readDatasetSettings,
  writeDatasetSettings,
} from "../utils/datasetVisibility"
import { readPublications, sortPublications, writePublications } from "../utils/publications"
import "../styles/pages/admin.css"

const initialPublicationForm = {
  number: "",
  year: new Date().getFullYear().toString(),
  category: "",
  title: "",
  description: "",
}

const publicationCategories = [
  "Kemiskinan",
  "Infografis Kecamatan",
  "Metadata",
  "Lainnya",
  "Perekonomian",
  "Survey Kepuasan",
  "Profil Kota",
  "Inflasi",
  "Regulasi",
  "Rekomendasi Statistik",
  "Metadata Statistik Sektoral",
]

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatDate(value) {
  if (!value) {
    return "-"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function readPortalTokenUser() {
  const token = localStorage.getItem("token")

  if (!token) {
    return null
  }

  try {
    const [, payload] = token.split(".")

    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(window.atob(normalized))

    return {
      username: decoded.user || "-",
      displayName: decoded.display_name || decoded.user || "-",
      provider: decoded.provider || "portal",
      source: decoded.identity_source || decoded.source || "unknown",
    }
  } catch {
    return null
  }
}

function Admin() {
  const [datasets, setDatasets] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedId, setSelectedId] = useState(null)
  const [draftNote, setDraftNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [publications, setPublications] = useState(() => sortPublications(readPublications()))
  const [publicationForm, setPublicationForm] = useState(initialPublicationForm)
  const [proposalFile, setProposalFile] = useState(null)
  const [proposalImage, setProposalImage] = useState(null)
  const [editingPublicationId, setEditingPublicationId] = useState(null)
  const [publicationSubmitting, setPublicationSubmitting] = useState(false)
  const [publicationError, setPublicationError] = useState("")
  const [publicationSuccess, setPublicationSuccess] = useState("")
  const [portalUser, setPortalUser] = useState(() => readPortalTokenUser())

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      window.location.href = CKAN_LOGIN_URL
      return
    }

    setPortalUser(readPortalTokenUser())
  }, [])

  const loadDatasets = () => {
    setLoading(true)
    setError("")

    axios
      .get(`${API_BASE_URL}/api/datasets`)
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

  const handlePublicationFieldChange = (field, value) => {
    setPublicationForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetPublicationForm = () => {
    setPublicationForm(initialPublicationForm)
    setProposalFile(null)
    setProposalImage(null)
    setEditingPublicationId(null)
  }

  const handleEditPublication = (publication) => {
    setPublicationError("")
    setPublicationSuccess("")
    setEditingPublicationId(publication.id)
    setPublicationForm({
      number: publication.number || "",
      year: publication.year || new Date().getFullYear().toString(),
      category: publication.category || "",
      title: publication.title || "",
      description: publication.description || "",
    })
    setProposalFile(null)
    setProposalImage(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePublicationSubmit = async (event) => {
    event.preventDefault()
    setPublicationError("")
    setPublicationSuccess("")
    const editingPublication = publications.find((publication) => publication.id === editingPublicationId) || null

    if (
      !publicationForm.number.trim() ||
      !publicationForm.year.trim() ||
      !publicationForm.category.trim() ||
      !publicationForm.title.trim() ||
      !publicationForm.description.trim()
    ) {
      setPublicationError("Nomor, tahun, kategori, judul, dan deskripsi proposal wajib diisi.")
      return
    }

    if (!proposalFile && !editingPublication?.proposalData) {
      setPublicationError("File proposal wajib diunggah.")
      return
    }

    if (!proposalImage && !editingPublication?.imageData) {
      setPublicationError("Gambar proposal wajib diunggah.")
      return
    }

    setPublicationSubmitting(true)

    try {
      const proposalData = proposalFile
        ? await fileToDataUrl(proposalFile)
        : editingPublication?.proposalData || ""
      const imageData = proposalImage
        ? await fileToDataUrl(proposalImage)
        : editingPublication?.imageData || ""
      const nextPublication = {
        id: editingPublicationId || crypto.randomUUID(),
        number: publicationForm.number.trim(),
        year: publicationForm.year.trim(),
        category: publicationForm.category.trim(),
        title: publicationForm.title.trim(),
        description: publicationForm.description.trim(),
        proposalName: proposalFile?.name || editingPublication?.proposalName || "",
        proposalData,
        imageName: proposalImage?.name || editingPublication?.imageName || "",
        imageData,
        createdAt: editingPublication?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const remainingPublications = editingPublicationId
        ? publications.filter((publication) => publication.id !== editingPublicationId)
        : publications
      const nextPublications = sortPublications([nextPublication, ...remainingPublications])
      setPublications(nextPublications)
      writePublications(nextPublications)
      window.dispatchEvent(new Event("portal-publications-updated"))

      resetPublicationForm()
      setPublicationSuccess(
        editingPublicationId
          ? "Proposal publikasi berhasil diperbarui."
          : "Proposal publikasi berhasil ditambahkan ke portal.",
      )
    } catch {
      setPublicationError("Terjadi kendala saat memproses file proposal. Coba ulangi.")
    } finally {
      setPublicationSubmitting(false)
    }
  }

  const handleDeletePublication = (publicationId) => {
    const nextPublications = publications.filter((publication) => publication.id !== publicationId)
    setPublications(nextPublications)
    writePublications(nextPublications)
    window.dispatchEvent(new Event("portal-publications-updated"))

    if (editingPublicationId === publicationId) {
      resetPublicationForm()
    }
  }

  const publicationStats = useMemo(() => {
    const total = publications.length
    const currentYear = new Date().getFullYear().toString()
    const currentYearTotal = publications.filter((publication) => publication.year === currentYear).length
    const withFiles = publications.filter((publication) => publication.proposalData).length

    return {
      total,
      currentYearTotal,
      withFiles,
    }
  }, [publications])

  const datasetStats = useMemo(() => {
    const total = datasets.length
    const visible = datasets.filter((dataset) => dataset.adminVisible).length
    const hidden = total - visible
    const featured = datasets.filter((dataset) => dataset.adminFeatured).length

    return { total, visible, hidden, featured }
  }, [datasets])

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <div>
          <span className="admin-kicker">Portal Admin Center</span>
          <h1>Dashboard Pengelolaan Data dan Publikasi</h1>
          <p>
            Kelola dataset CKAN, atur prioritas konten portal, dan tambahkan proposal publikasi
            agar langsung muncul di halaman publikasi portal.
          </p>
          {portalUser ? (
            <div className="admin-auth-status">
              <span>Login sebagai</span>
              <strong>{portalUser.displayName}</strong>
              <small>{portalUser.provider} • {portalUser.source}</small>
            </div>
          ) : null}
        </div>

        <div className="admin-hero__actions">
          <a href="/" className="btn btn-outline-dark">Lihat Portal</a>
          <button className="btn btn-dark" onClick={loadDatasets}>
            Sinkronkan Dataset
          </button>
        </div>
      </section>

      <section className="admin-overview">
        <article className="admin-overview-card">
          <span>Dataset CKAN</span>
          <strong>{datasetStats.total}</strong>
          <small>Total dataset yang terhubung ke portal</small>
        </article>
        <article className="admin-overview-card">
          <span>Dataset Tampil</span>
          <strong>{datasetStats.visible}</strong>
          <small>Dataset aktif di halaman portal</small>
        </article>
        <article className="admin-overview-card">
          <span>Unggulan</span>
          <strong>{datasetStats.featured}</strong>
          <small>Konten dataset yang diprioritaskan</small>
        </article>
        <article className="admin-overview-card">
          <span>Proposal Publikasi</span>
          <strong>{publicationStats.total}</strong>
          <small>Total proposal yang tersimpan dari admin</small>
        </article>
      </section>

      <section className="admin-layout">
        <div className="admin-main">
          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h2>Manajemen Dataset</h2>
                <p>Kontrol visibilitas, status unggulan, dan catatan editorial dataset.</p>
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

            {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

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

          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h2>Proposal Publikasi</h2>
                <p>
                  Tambahkan proposal publikasi yang akan langsung ditampilkan di halaman
                  publikasi portal.
                </p>
              </div>
            </div>

            <form className="admin-publication-form" onSubmit={handlePublicationSubmit}>
              {editingPublicationId ? (
                <div className="admin-alert admin-alert--success">
                  Mode edit aktif. Perbarui data proposal lalu klik simpan.
                </div>
              ) : null}

              <div className="admin-form-grid admin-form-grid--publication">
                <label className="admin-form-field">
                  <span>Nomor Proposal</span>
                  <input
                    className="form-control"
                    placeholder="Contoh: 001/PUB"
                    value={publicationForm.number}
                    onChange={(event) => handlePublicationFieldChange("number", event.target.value)}
                  />
                </label>

                <label className="admin-form-field">
                  <span>Tahun</span>
                  <input
                    className="form-control"
                    placeholder="2026"
                    value={publicationForm.year}
                    onChange={(event) => handlePublicationFieldChange("year", event.target.value)}
                  />
                </label>

                <label className="admin-form-field">
                  <span>Kategori</span>
                  <select
                    className="form-select"
                    value={publicationForm.category}
                    onChange={(event) => handlePublicationFieldChange("category", event.target.value)}
                  >
                    <option value="">Pilih kategori</option>
                    {publicationCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="admin-form-field">
                <span>Judul Proposal</span>
                <input
                  className="form-control"
                  placeholder="Masukkan judul proposal publikasi"
                  value={publicationForm.title}
                  onChange={(event) => handlePublicationFieldChange("title", event.target.value)}
                />
              </label>

              <label className="admin-form-field">
                <span>Deskripsi Proposal</span>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Jelaskan isi proposal publikasi"
                  value={publicationForm.description}
                  onChange={(event) => handlePublicationFieldChange("description", event.target.value)}
                />
              </label>

              <div className="admin-form-grid">
                <label className="admin-upload">
                  <span>Upload Proposal</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => setProposalFile(event.target.files?.[0] || null)}
                  />
                  <small>
                    {proposalFile
                      ? proposalFile.name
                      : editingPublicationId
                        ? "Kosongkan jika ingin tetap memakai file proposal lama"
                        : "Belum ada file proposal dipilih"}
                  </small>
                </label>

                <label className="admin-upload">
                  <span>Upload Gambar Proposal</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setProposalImage(event.target.files?.[0] || null)}
                  />
                  <small>
                    {proposalImage
                      ? proposalImage.name
                      : editingPublicationId
                        ? "Kosongkan jika ingin tetap memakai gambar proposal lama"
                        : "Belum ada gambar proposal dipilih"}
                  </small>
                </label>
              </div>

              {publicationError ? <div className="admin-alert admin-alert--error">{publicationError}</div> : null}
              {publicationSuccess ? <div className="admin-alert admin-alert--success">{publicationSuccess}</div> : null}

              <div className="admin-publication-card__actions">
                <button className="btn btn-dark" type="submit" disabled={publicationSubmitting}>
                  {publicationSubmitting
                    ? "Menyimpan..."
                    : editingPublicationId
                      ? "Simpan Perubahan"
                      : "Simpan Proposal Publikasi"}
                </button>
                {editingPublicationId ? (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetPublicationForm}>
                    Batal
                  </button>
                ) : null}
              </div>
            </form>

            <div className="admin-publication-list">
              <div className="admin-publication-list__head">
                <h3>Daftar Proposal</h3>
                <span>{publicationStats.total} proposal tersimpan</span>
              </div>

              {publications.length === 0 ? (
                <div className="admin-empty">Belum ada proposal publikasi yang ditambahkan.</div>
              ) : (
                <div className="admin-publication-cards">
                  {publications.map((publication) => (
                    <article className="admin-publication-card" key={publication.id}>
                      <div>
                        <div className="admin-publication-card__chips">
                          <span>{publication.number}</span>
                          <span>{publication.year}</span>
                          <span>{publication.category || "Proposal Publikasi"}</span>
                        </div>
                        <h4>{publication.title}</h4>
                        <p>{publication.description}</p>
                      </div>

                      <div className="admin-publication-card__meta">
                        <small>Dibuat {formatDate(publication.createdAt)}</small>
                        <div className="admin-publication-card__actions">
                          {publication.proposalData ? (
                            <a
                              href={publication.proposalData}
                              download={publication.proposalName || `${publication.title}.pdf`}
                              className="btn btn-sm btn-outline-dark"
                            >
                              Unduh
                            </a>
                          ) : null}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditPublication(publication)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeletePublication(publication.id)}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="admin-sidebar">
          <div className="admin-panel admin-panel--detail">
            <div className="admin-panel__header">
              <div>
                <h2>Detail Dataset</h2>
                <p>Atur prioritas dan catatan editorial dataset aktif.</p>
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
                    {selectedDataset.adminFeatured ? (
                      <span className="admin-badge is-featured">Unggulan</span>
                    ) : null}
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
                    <strong>{selectedDataset.adminUpdatedAt ? formatDate(selectedDataset.adminUpdatedAt) : "-"}</strong>
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

          <div className="admin-panel">
            <div className="admin-panel__header">
              <div>
                <h2>Ringkasan Publikasi</h2>
                <p>Pantau perkembangan proposal publikasi portal.</p>
              </div>
            </div>

            <div className="admin-mini-stats">
              <article className="admin-mini-stat">
                <span>Total Proposal</span>
                <strong>{publicationStats.total}</strong>
              </article>
              <article className="admin-mini-stat">
                <span>Tahun Ini</span>
                <strong>{publicationStats.currentYearTotal}</strong>
              </article>
              <article className="admin-mini-stat">
                <span>File Tersedia</span>
                <strong>{publicationStats.withFiles}</strong>
              </article>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}

export default Admin
