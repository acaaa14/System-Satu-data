import { useEffect, useMemo, useState } from "react"
import fallbackImage from "../assets/img/GambarPublikasi.png"
import { fetchPublications } from "../utils/ckan"
import { CKAN_BASE_URL } from "../utils/ckanAuth"
import "../styles/pages/publikasi.css"

const ITEMS_PER_PAGE = 10

function formatDate(value) {
  if (!value) return "Baru saja"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Baru saja"

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function buildPagination(currentPage, totalPages) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) return [1, 2, 3, 4, 5]
  if (currentPage >= totalPages - 2) {
    return Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)
  }

  return Array.from({ length: 5 }, (_, index) => currentPage - 2 + index)
}

function getPublicationCategory(dataset) {
  // Kategori halaman Publikasi mengikuti tag CKAN agar admin cukup mengelola tag di sumber data.
  const tagNames = (dataset.tags || [])
    .map((tag) => tag.display_name || tag.name || "")
    .filter(Boolean)

  if (tagNames.length > 0) {
    return tagNames.join(", ")
  }

  return "-"
}

function getPublicationYear(dataset) {
  // Tahun diprioritaskan dari judul karena beberapa publikasi menaruh tahun rilis di nama dataset.
  const title = dataset.title || dataset.name || ""
  const yearMatch = title.match(/\b(19|20)\d{2}\b/)

  if (yearMatch) {
    return yearMatch[0]
  }

  const rawValue = dataset.metadata_modified || dataset.metadata_created || dataset.created || ""
  const date = new Date(rawValue)

  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return String(date.getFullYear())
}

function normalizeCkanAssetUrl(value) {
  // CKAN kadang mengirim path relatif seperti `/uploads/...`, jadi diubah dulu ke URL absolut.
  if (!value || typeof value !== "string") {
    return ""
  }

  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) {
    return value
  }

  if (value.startsWith("//")) {
    return `${window.location.protocol}${value}`
  }

  const baseUrl = CKAN_BASE_URL.replace(/\/+$/, "")
  const path = value.startsWith("/") ? value : `/${value}`

  return `${baseUrl}${path}`
}

function getPublicationImage(dataset) {
  // Gambar publikasi mengikuti logo/gambar organisasi dari CKAN.
  const organizationImage =
    dataset.organization?.image_display_url ||
    dataset.organization?.image_url ||
    ""

  return normalizeCkanAssetUrl(organizationImage)
}

function mapPublication(dataset) {
  const primaryResource = dataset.resources?.[0] || null

  // Payload CKAN dirapikan ke shape yang stabil supaya tabel publikasi tidak perlu tahu
  // detail struktur asli dari response CKAN.
  return {
    id: dataset.id,
    title: dataset.title || dataset.name || "Tanpa Judul",
    description: dataset.notes?.trim() || "Belum ada deskripsi publikasi.",
    year: getPublicationYear(dataset),
    category: getPublicationCategory(dataset),
    createdAt: dataset.metadata_modified || dataset.metadata_created || dataset.created || null,
    imageData: getPublicationImage(dataset) || fallbackImage,
    downloadUrl: primaryResource?.url || "",
    downloadName: primaryResource?.name || `${dataset.title || dataset.name || "publikasi"}.pdf`,
  }
}

export default function Publikasi() {
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [titleFilter, setTitleFilter] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    async function loadPublications() {
      setLoading(true)
      setError("")

      try {
        const result = await fetchPublications()

        if (isMounted) {
          setPublications(result.map(mapPublication))
        }
      } catch {
        if (isMounted) {
          setPublications([])
          setError("Gagal memuat publikasi dari CKAN.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPublications()

    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    return Array.from(new Set(publications.map((publication) => publication.category)))
  }, [publications])

  const filtered = useMemo(() => {
    return publications.filter((publication) => (
      (!categoryFilter || publication.category === categoryFilter) &&
      (!yearFilter || String(publication.year).includes(yearFilter)) &&
      (!titleFilter || publication.title.toLowerCase().includes(titleFilter.toLowerCase()))
    ))
  }, [publications, categoryFilter, yearFilter, titleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1
  const endEntry = Math.min(page * ITEMS_PER_PAGE, filtered.length)
  const paginationItems = buildPagination(page, totalPages)

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  useEffect(() => {
    setPage(1)
  }, [categoryFilter, yearFilter, titleFilter])

  return (
    <main className="publikasi-page">
      <section className="publikasi-hero">
        <div className="container">
          <div className="publikasi-hero__content">
            <h1>Publikasi</h1>
            <p>
              <button
                type="button"
                className="publikasi-breadcrumb-link"
                onClick={() => {
                  window.location.href = "/"
                }}
              >
                Home
              </button>
              <span>/</span> <strong>Publikasi</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="publikasi-section">
        <div className="container">
          <div className="publikasi-filters">
            <label className="publikasi-filters__field">
              <span>Kategori</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="">Semua Kategori</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>

            <label className="publikasi-filters__field">
              <span>Tahun</span>
              <input
                type="text"
                placeholder="Tahun"
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
              />
            </label>

            <label className="publikasi-filters__field">
              <span>Judul</span>
              <input
                type="text"
                placeholder="Judul"
                value={titleFilter}
                onChange={(event) => setTitleFilter(event.target.value)}
              />
            </label>

            <button
              type="button"
              className="publikasi-filters__search"
              onClick={() => setPage(1)}
              aria-label="Cari publikasi"
            >
              ⌕
            </button>
          </div>

          <div className="publikasi-board">
            <div className="publikasi-board__header">
              <div>
                <h2>Manajemen Permohonan</h2>
                <div className="publikasi-board__entries">
                  <span>Show</span>
                  <strong>{filtered.length}</strong>
                  <span>Entries</span>
                </div>
              </div>
            </div>

            <div className="publikasi-table">
              <div className="publikasi-table__head" aria-hidden="true">
                <span>No</span>
                <span>Tahun</span>
                <span>Judul</span>
                <span>Detail</span>
                <span>Aksi</span>
              </div>

              {error ? (
                <div className="publikasi-table__empty">{error}</div>
              ) : null}

              {!error && loading ? (
                <div className="publikasi-table__empty">Memuat publikasi dari CKAN...</div>
              ) : null}

              {!error && !loading && paginated.length === 0 ? (
                <div className="publikasi-table__empty">
                  Belum ada publikasi CKAN dari group `topik` yang cocok dengan filter.
                </div>
              ) : null}

              {!error && !loading ? paginated.map((item, index) => {
                const itemNumber = (page - 1) * ITEMS_PER_PAGE + index + 1

                return (
                  <article className="publikasi-row" key={item.id}>
                    <div className="publikasi-row__cell publikasi-row__cell--number">
                      <span className="publikasi-row__label">No</span>
                      <strong>{itemNumber}.</strong>
                    </div>

                    <div className="publikasi-row__cell publikasi-row__cell--year">
                      <span className="publikasi-row__label">Tahun</span>
                      <strong>{item.year || "-"}</strong>
                    </div>

                    <div className="publikasi-row__cell publikasi-row__cell--title">
                      <span className="publikasi-row__label">Judul</span>
                      <h3>{item.title}</h3>
                    </div>

                    <div className="publikasi-row__cell publikasi-row__cell--detail">
                      <img
                        src={item.imageData || fallbackImage}
                        alt={item.title}
                        onError={(event) => {
                          event.currentTarget.onerror = null
                          event.currentTarget.src = fallbackImage
                        }}
                      />
                      <dl className="publikasi-detail">
                        <div>
                          <dt>Judul</dt>
                          <dd>{item.title}</dd>
                        </div>
                        <div>
                          <dt>Tentang</dt>
                          <dd>{item.description}</dd>
                        </div>
                        <div>
                          <dt>Tahun</dt>
                          <dd>{item.year || "-"}</dd>
                        </div>
                        <div>
                          <dt>Kategori</dt>
                          <dd>{item.category}</dd>
                        </div>
                        <div>
                          <dt>Lampiran</dt>
                          <dd>{item.downloadUrl ? "Tersedia" : "Tidak tersedia"}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="publikasi-row__cell publikasi-row__cell--action">
                      <span className="publikasi-row__label">Aksi</span>
                      {item.downloadUrl ? (
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-download"
                          download={item.downloadName}
                        >
                          Download
                        </a>
                      ) : (
                        <span className="btn-disabled">Unavailable</span>
                      )}
                    </div>
                  </article>
                )
              }) : null}
            </div>
          </div>

          <div className="publikasi-footer">
            <p>
              Showing {startEntry} to {endEntry} of {filtered.length} entries
            </p>

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>

              {paginationItems.map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={page === pageNumber ? "active" : ""}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="publikasi-scroll-top"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ˄
        </button>
      </section>
    </main>
  )
}
