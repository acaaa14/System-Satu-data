import { useEffect, useMemo, useState } from "react"
import fallbackImage from "../assets/img/GambarPublikasi.png"
import { readPublications, sortPublications } from "../utils/publications"
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

export default function Publikasi() {
  const [publications, setPublications] = useState(() =>
    sortPublications(readPublications())
  )
  const [categoryFilter, setCategoryFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [titleFilter, setTitleFilter] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const sync = () => setPublications(sortPublications(readPublications()))
    window.addEventListener("portal-publications-updated", sync)
    return () => window.removeEventListener("portal-publications-updated", sync)
  }, [])

  const categories = useMemo(() => {
    return Array.from(
      new Set(publications.map((p) => p.category || "Proposal Publikasi"))
    )
  }, [publications])

  const filtered = useMemo(() => {
    return publications.filter((p) => {
      const category = p.category || "Proposal Publikasi"
      return (
        (!categoryFilter || category === categoryFilter) &&
        (!yearFilter || String(p.year).includes(yearFilter)) &&
        (!titleFilter ||
          p.title.toLowerCase().includes(titleFilter.toLowerCase()))
      )
    })
  }, [publications, categoryFilter, yearFilter, titleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1
  const endEntry = Math.min(page * ITEMS_PER_PAGE, filtered.length)
  const paginationItems = buildPagination(page, totalPages)

  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, page])

  useEffect(() => setPage(1), [categoryFilter, yearFilter, titleFilter])

  return (
    <main className="publikasi-page">
      <section className="publikasi-hero">
        <div className="container">
          <div className="publikasi-hero__content">
            <h1>Publikasi</h1>
            <p>Home / <strong>Publikasi</strong></p>
          </div>
        </div>
      </section>

      <section className="publikasi-section">
        <div className="container">
          <div className="publikasi-filters">
            <label className="publikasi-filters__field">
              <span>Kategori</span>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
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
                onChange={(e) => setYearFilter(e.target.value)}
              />
            </label>

            <label className="publikasi-filters__field">
              <span>Judul</span>
              <input
                type="text"
                placeholder="Judul"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              />
            </label>

            <button type="button" className="publikasi-filters__search" onClick={() => setPage(1)} aria-label="Cari publikasi">
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

              {paginated.length === 0 ? (
                <div className="publikasi-table__empty">
                  Belum ada publikasi yang cocok dengan filter yang dipilih.
                </div>
              ) : (
                paginated.map((item, index) => {
                  const itemNumber = (page - 1) * ITEMS_PER_PAGE + index + 1
                  const category = item.category || "Proposal Publikasi"
                  const description = item.description?.trim() || "Belum ada deskripsi publikasi."

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
                        <img src={item.imageData || fallbackImage} alt={item.title} />
                        <dl className="publikasi-detail">
                          <div>
                            <dt>Judul</dt>
                            <dd>{item.title}</dd>
                          </div>
                          <div>
                            <dt>Tentang</dt>
                            <dd>{description}</dd>
                          </div>
                          <div>
                            <dt>Tahun</dt>
                            <dd>{item.year || "-"}</dd>
                          </div>
                          <div>
                            <dt>Kategori</dt>
                            <dd>{category}</dd>
                          </div>
                          <div>
                            <dt>Publikasi</dt>
                            <dd>{formatDate(item.createdAt)}</dd>
                          </div>
                          <div>
                            <dt>Lampiran</dt>
                            <dd>{item.proposalData ? "Tersedia" : "Tidak tersedia"}</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="publikasi-row__cell publikasi-row__cell--action">
                        <span className="publikasi-row__label">Aksi</span>
                        {item.proposalData ? (
                          <a
                            href={item.proposalData}
                            download={item.proposalName || `${item.title}.pdf`}
                            className="btn-download"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="btn-disabled">Unavailable</span>
                        )}
                      </div>
                    </article>
                  )
                })
              )}
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
