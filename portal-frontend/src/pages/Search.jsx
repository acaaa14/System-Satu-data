import { useEffect, useMemo, useState } from "react"
import fallbackImage from "../assets/img/GambarPublikasi.png"
import logoPortal from "../assets/img/logologin.png"
import { fetchDatasets, fetchOrganizations } from "../utils/ckan"
import { readPublications, sortPublications } from "../utils/publications"
import "../styles/pages/search.css"

const homeTopics = [
  "Pemerintah",
  "Infrastruktur",
  "Ekonomi",
  "Sosial dan budaya",
  "Covid-19",
]

function getInitialQuery() {
  return new URLSearchParams(window.location.search).get("q") || ""
}

function formatDate(value) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function HighlightedText({ text, query }) {
  if (!query.trim()) {
    return text
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"))

  return parts.map((part, index) => (
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : <span key={`${part}-${index}`}>{part}</span>
  ))
}

export default function Search({ onHomeClick, onOrganisasiClick, onPublikasiClick, onSearchNavigate }) {
  const [query, setQuery] = useState(getInitialQuery)
  const [sortBy, setSortBy] = useState("latest")
  const [pageFilter, setPageFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [datasetResults, setDatasetResults] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(false)

  const publications = useMemo(() => sortPublications(readPublications()), [])

  useEffect(() => {
    setQuery(getInitialQuery())
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadOrganizations() {
      try {
        const result = await fetchOrganizations()
        if (isMounted) {
          setOrganizations(result)
        }
      } catch {
        if (isMounted) {
          setOrganizations([])
        }
      }
    }

    loadOrganizations()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const keyword = query.trim()

    if (!keyword) {
      setDatasetResults([])
      return
    }

    let isMounted = true
    setLoading(true)

    fetchDatasets(keyword)
      .then((result) => {
        if (isMounted) {
          setDatasetResults(result)
        }
      })
      .catch(() => {
        if (isMounted) {
          setDatasetResults([])
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [query])

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase()

    if (!keyword) {
      return []
    }

    const datasetItems = datasetResults.map((dataset) => ({
      id: `dataset-${dataset.id || dataset.name}`,
      page: "Open Data",
      category: "Dataset",
      title: dataset.title || dataset.name || "Dataset tanpa judul",
      description: dataset.notes || "Dataset dari CKAN",
      image: logoPortal,
      date: dataset.metadata_modified || dataset.metadata_created || null,
      tags: [dataset.organization?.title, dataset.author, dataset.private ? "Private" : "Publik"].filter(Boolean),
      action: () => {
        const slug = dataset.name || dataset.id
        if (slug) {
          window.location.href = `http://localhost:5000/dataset/${slug}`
        }
      },
    }))

    const publicationItems = publications
      .filter((publication) => {
        const haystack = [
          publication.title,
          publication.description,
          publication.category,
          publication.year,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return haystack.includes(keyword)
      })
      .map((publication) => ({
        id: `publication-${publication.id}`,
        page: "Halaman",
        category: publication.category || "Publikasi",
        title: publication.title,
        description: publication.description || "Publikasi portal",
        image: publication.imageData || fallbackImage,
        date: publication.createdAt,
        tags: ["Publikasi", publication.year].filter(Boolean),
        action: () => onPublikasiClick?.(),
      }))

    const organizationItems = organizations
      .filter((organization) => {
        const haystack = [
          organization.title,
          organization.display_name,
          organization.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return haystack.includes(keyword)
      })
      .map((organization) => ({
        id: `organization-${organization.id || organization.name}`,
        page: "Halaman",
        category: "Organisasi",
        title: organization.title || organization.display_name || organization.name || "Tanpa nama organisasi",
        description: `${organization.package_count ?? 0} dataset tersedia di CKAN`,
        image: organization.image_display_url || organization.image_url || logoPortal,
        date: organization.metadata_modified || organization.created || null,
        tags: ["Organisasi", `${organization.package_count ?? 0} dataset`],
        action: () => onOrganisasiClick?.(),
      }))

    const topicItems = homeTopics
      .filter((topic) => topic.toLowerCase().includes(keyword))
      .map((topic) => ({
        id: `topic-${topic}`,
        page: "Halaman",
        category: "Topik",
        title: topic,
        description: "Topik unggulan yang tampil di halaman utama portal",
        image: logoPortal,
        date: null,
        tags: ["Topik Home"],
        action: () => onHomeClick?.(),
      }))

    return [...datasetItems, ...publicationItems, ...organizationItems, ...topicItems]
      .filter((item) => pageFilter === "All" || item.page === pageFilter)
      .filter((item) => categoryFilter === "All" || item.category === categoryFilter)
      .sort((left, right) => {
        if (sortBy === "title") {
          return left.title.localeCompare(right.title)
        }

        if (sortBy === "category") {
          return left.category.localeCompare(right.category)
        }

        return new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime()
      })
  }, [query, datasetResults, publications, organizations, pageFilter, categoryFilter, sortBy, onPublikasiClick, onOrganisasiClick, onHomeClick])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearchNavigate?.(query)
  }

  return (
    <main className="search-page">
      <section className="search-section">
        <div className="container">
          <div className="search-breadcrumb">
            <button type="button" onClick={onHomeClick}>Home</button>
            <span>/</span>
            <strong>Pencarian</strong>
          </div>

          <form className="search-toolbar" onSubmit={handleSubmit}>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari data, organisasi, publikasi, atau topik"
              aria-label="Cari"
            />
            <button type="button" className="search-toolbar__clear" onClick={() => setQuery("")} aria-label="Hapus pencarian">
              ×
            </button>
            <button type="submit" className="search-toolbar__submit" aria-label="Cari">
              ⌕
            </button>
          </form>

          <div className="search-summary">
            <h1>{loading ? "Mencari data..." : `${results.length} Data ditemukan`}</h1>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="latest">Tanggal Terbaru</option>
              <option value="title">Judul A-Z</option>
              <option value="category">Kategori</option>
            </select>
          </div>

          <div className="search-layout">
            <aside className="search-sidebar">
              <div className="search-filter-group">
                <h2>Halaman</h2>
                {["All", "Open Data", "Halaman"].map((item) => (
                  <label key={item} className="search-check">
                    <input type="radio" checked={pageFilter === item} onChange={() => setPageFilter(item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>

              <div className="search-filter-group">
                <h2>Kategori</h2>
                {["All", "Dataset", "Organisasi", "Publikasi", "Topik"].map((item) => (
                  <label key={item} className="search-check">
                    <input type="radio" checked={categoryFilter === item} onChange={() => setCategoryFilter(item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </aside>

            <div className="search-results-wrap">
              {query.trim() ? (
                <p className="search-hint">
                  Mungkin yang anda maksud <strong>{query}</strong>
                </p>
              ) : null}

              {results.length === 0 && !loading ? (
                <div className="search-empty">Belum ada hasil yang cocok dengan pencarian ini.</div>
              ) : null}

              <div className="search-results">
                {results.map((item) => (
                  <article className="search-card" key={item.id}>
                    <div className="search-card__thumb">
                      <img src={item.image} alt={item.title} />
                    </div>

                    <div className="search-card__content">
                      <h3>
                        <HighlightedText text={item.title} query={query.trim()} />
                      </h3>

                      <div className="search-card__tags">
                        {item.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>

                      <p>
                        <HighlightedText text={item.description} query={query.trim()} />
                      </p>

                      <div className="search-card__meta">
                        <span className="is-page">{item.page}</span>
                        <span className="is-category">{item.category}</span>
                        <small>{formatDate(item.date)}</small>
                      </div>

                      <button type="button" className="search-card__action" onClick={item.action}>
                        Buka hasil
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
