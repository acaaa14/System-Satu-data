import { useEffect, useMemo, useRef, useState } from "react"
import heroImage from "../assets/gammbarkomputer.png"
import logoPortal from "../assets/img/logologin.png"
import datasetStatsImage from "../assets/img/GambarDataset.png"
import organisasiStatsImage from "../assets/img/GambarOrganisasi.png"
import topikStatsImage from "../assets/img/GambarTopik.png"
import publikasiStatsImage from "../assets/img/GambarPublikasi.png"
import pemerintahImage from "../assets/img/GambarPemerintah.png"
import infrastrukturImage from "../assets/img/GambarInfrastruktur.png"
import ekonomiImage from "../assets/img/GambarEkonomi.png"
import sosialImage from "../assets/img/GambarSosialBudaya.png"
import covidImage from "../assets/img/GambarCovid-19.png"
import { topicDefinitions } from "../utils/topics"
import { fetchDatasets, fetchOrganizations, fetchPublications } from "../utils/ckan"
import { CKAN_BASE_URL } from "../utils/ckanAuth"
import { normalizePortalOrganizations } from "../utils/portalSections"
import "../styles/pages/home.css"

const topics = [
  { label: "Pemerintah", image: pemerintahImage },
  { label: "Infrastruktur", image: infrastrukturImage },
  { label: "Ekonomi", image: ekonomiImage },
  { label: "Sosial dan budaya", image: sosialImage },
  { label: "Covid-19", image: covidImage },
]

function formatDatasetDate(value) {
  if (!value) return "Baru saja"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Baru saja"
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getDatasetDateValue(dataset) {
  return dataset.metadata_modified || dataset.metadata_created || dataset.created || ""
}

function getDatasetTitle(dataset) {
  return dataset.title || dataset.name || "Dataset tanpa judul"
}

function getDatasetUrl(dataset) {
  const slug = dataset.name || dataset.id

  if (!slug) {
    return CKAN_BASE_URL
  }

  return `${CKAN_BASE_URL.replace(/\/+$/, "")}/dataset/${slug}`
}

function sortNewestDatasets(datasets) {
  return [...datasets].sort((left, right) => {
    const leftTime = new Date(getDatasetDateValue(left)).getTime() || 0
    const rightTime = new Date(getDatasetDateValue(right)).getTime() || 0

    return rightTime - leftTime
  })
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

export default function Home({ onOrganisasiClick, onPublikasiClick, onSearchNavigate }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [datasetsCount, setDatasetsCount] = useState(0)
  const [latestDatasets, setLatestDatasets] = useState([])
  const [activeDatasetSlide, setActiveDatasetSlide] = useState(0)
  const [visibleDatasetCards, setVisibleDatasetCards] = useState(3)
  const [organizations, setOrganizations] = useState([])
  const [publications, setPublications] = useState([])
  const [activeDatasetTitle, setActiveDatasetTitle] = useState("")
  const [activeTopicLabel, setActiveTopicLabel] = useState("")
  const [activeStatLabel, setActiveStatLabel] = useState("")
  const statsRef = useRef(null)
  const topicsRef = useRef(null)
  const datasetsRef = useRef(null)
  const datasetScrollerRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    async function loadPortalSummary() {
      try {
        const [datasetResult, organizationResult, publicationResult] = await Promise.all([
          fetchDatasets(),
          fetchOrganizations(),
          fetchPublications(),
        ])

        if (isMounted) {
          setDatasetsCount(datasetResult.length)
          setLatestDatasets(sortNewestDatasets(datasetResult).slice(0, 10))
          setOrganizations(normalizePortalOrganizations(organizationResult, publicationResult))
          setPublications(publicationResult)
        }
      } catch {
        if (isMounted) {
          setDatasetsCount(0)
          setLatestDatasets([])
          setOrganizations([])
          setPublications([])
        }
      }
    }

    loadPortalSummary()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const scroller = datasetScrollerRef.current

    if (!scroller) {
      return undefined
    }

    function updateDatasetCarousel() {
      const firstCard = scroller.querySelector(".dataset-card")

      if (!firstCard) {
        setActiveDatasetSlide(0)
        setVisibleDatasetCards(1)
        return
      }

      const cardWidth = firstCard.getBoundingClientRect().width
      const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0
      const step = Math.max(1, cardWidth + gap)
      const visibleCards = Math.max(1, Math.round((scroller.clientWidth + gap) / step))

      setVisibleDatasetCards(visibleCards)
      setActiveDatasetSlide(Math.round(scroller.scrollLeft / step))
    }

    updateDatasetCarousel()
    scroller.addEventListener("scroll", updateDatasetCarousel, { passive: true })
    window.addEventListener("resize", updateDatasetCarousel)

    return () => {
      scroller.removeEventListener("scroll", updateDatasetCarousel)
      window.removeEventListener("resize", updateDatasetCarousel)
    }
  }, [latestDatasets.length])

  const stats = useMemo(() => ([
    { icon: datasetStatsImage, value: datasetsCount, label: "Dataset" },
    { icon: organisasiStatsImage, value: organizations.length, label: "Organisasi" },
    { icon: topikStatsImage, value: topicDefinitions.length, label: "Topik" },
    { icon: publikasiStatsImage, value: publications.length, label: "Publikasi" },
  ]), [datasetsCount, organizations.length, publications.length])

  const focusSection = (ref, setActive, activeValue) => {
    setSearchOpen(false)
    setActive(activeValue)
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    window.setTimeout(() => setActive(""), 2200)
  }

  const searchResults = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    if (!keyword) {
      return []
    }

    const statResults = stats
      .filter((item) => item.label.toLowerCase().includes(keyword))
      .map((item) => ({
        id: `stat-${item.label}`,
        type: "Statistik",
        title: item.label,
        description: `${item.value} item pada ringkasan portal`,
        action: () => focusSection(statsRef, setActiveStatLabel, item.label),
      }))

    const topicResults = topics
      .filter((topic) => topic.label.toLowerCase().includes(keyword))
      .map((topic) => ({
        id: `topic-${topic.label}`,
        type: "Topik",
        title: topic.label,
        description: "Topik unggulan portal data",
        action: () => focusSection(topicsRef, setActiveTopicLabel, topic.label),
      }))

    const homeDatasetResults = latestDatasets
      .filter((dataset) => getDatasetTitle(dataset).toLowerCase().includes(keyword))
      .map((dataset) => ({
        id: `home-dataset-${dataset.id || dataset.name}`,
        type: "Dataset",
        title: getDatasetTitle(dataset),
        description: "Bagian Dataset Terbaru di halaman utama",
        action: () => focusSection(datasetsRef, setActiveDatasetTitle, getDatasetTitle(dataset)),
      }))

    const publicationResults = publications
      .filter((publication) => {
        const tagText = (publication.tags || [])
          .map((tag) => tag.display_name || tag.name)
          .filter(Boolean)
          .join(" ")
        const haystack = [
          publication.title,
          publication.name,
          publication.description,
          publication.notes,
          publication.category,
          publication.year,
          tagText,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return haystack.includes(keyword)
      })
      .slice(0, 3)
      .map((publication) => ({
        id: `publication-${publication.id}`,
        type: "Publikasi",
        title: publication.title || publication.name || "Tanpa Judul",
        description: publication.notes || "Publikasi CKAN",
        action: () => {
          onPublikasiClick?.()
          window.scrollTo({ top: 0, behavior: "smooth" })
        },
      }))

    const organizationResults = organizations
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
      .slice(0, 3)
      .map((organization) => ({
        id: `organization-${organization.id || organization.name}`,
        type: "Organisasi",
        title: organization.title,
        description: `${organization.packageCount} dataset tersedia`,
        action: () => {
          onOrganisasiClick?.()
          window.scrollTo({ top: 0, behavior: "smooth" })
        },
      }))

    return [...homeDatasetResults, ...publicationResults, ...organizationResults, ...topicResults, ...statResults]
      .filter((item, index, array) => array.findIndex((entry) => entry.title === item.title && entry.type === item.type) === index)
      .slice(0, 8)
  }, [searchQuery, latestDatasets, organizations, publications, onOrganisasiClick, onPublikasiClick])

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    onSearchNavigate?.(searchQuery)
  }

  const datasetDotCount = Math.max(1, latestDatasets.length - visibleDatasetCards + 1)

  const scrollToDatasetSlide = (index) => {
    const scroller = datasetScrollerRef.current
    const target = scroller?.querySelectorAll(".dataset-card")?.[index]

    if (!scroller || !target) {
      return
    }

    scroller.scrollTo({
      left: target.offsetLeft - scroller.offsetLeft,
      behavior: "smooth",
    })
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="home-hero__left">
            <h1>
              <span className="home-hero__title-line">
                <span className="home-hero__title-city">Tangerang</span> <span className="home-hero__title-brand">Satudata</span>
              </span>
              <span className="home-hero__title-location">Kota Tangerang</span>
            </h1>
            <p>Kemudahan dalam mengakses mencari data dengan cepat, tepat dan akurat.</p>

            <div className="home-hero__search-wrap">
              <form className="home-hero__search" role="search" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Apa yang ingin anda cari?"
                  aria-label="Cari data"
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
                <button type="submit" aria-label="Search">
                  ⌕
                </button>
              </form>

              {searchOpen && searchQuery.trim() ? (
                <div className="home-search-panel">
                  {searchResults.length === 0 ? (
                    <div className="home-search-panel__state">Belum ada hasil yang cocok.</div>
                  ) : null}

                  {searchResults.length > 0 ? (
                    <div className="home-search-results">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          className="home-search-result"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            result.action?.()
                          }}
                        >
                          <span className="home-search-result__type">{result.type}</span>
                          <strong>
                            <HighlightedText text={result.title} query={searchQuery.trim()} />
                          </strong>
                          <p>
                            <HighlightedText text={result.description} query={searchQuery.trim()} />
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="home-hero__right" aria-hidden="true">
            <img src={heroImage} alt="" />
          </div>
        </div>

        <button
          type="button"
          className="home-scroll-top"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ˄
        </button>
      </section>

      <section className="home-section home-section--stats" ref={statsRef}>
        <div className="container">
          <span className="section-badge">Fitur Unggulan</span>
          <h2>Statistik Portal Data Kota Tangerang</h2>

          <div className="stats-bar">
            {stats.map((item) => (
              <article
                key={item.label}
                className={`stats-bar__item ${activeStatLabel === item.label ? "is-highlighted" : ""}`}
              >
                <span className="stats-bar__icon" aria-hidden="true">
                  <img src={item.icon} alt="" />
                </span>
                <div>
                  <strong>{item.value}</strong>
                  <small>{item.label}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section" ref={topicsRef}>
        <div className="container">
          <span className="section-badge">Fitur Unggulan</span>
          <h2>
            Telusuri Berdasarkan
            <br />
            Group Atau Topik
          </h2>

          <div className="topic-strip">
            {topics.map((topic) => (
              <article
                key={topic.label}
                className={`topic-strip__item ${activeTopicLabel === topic.label ? "is-highlighted" : ""}`}
              >
                <div className="topic-strip__icon" aria-hidden="true">
                  <img src={topic.image} alt="" />
                </div>
                <span>{topic.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--cards" ref={datasetsRef}>
        <div className="container">
          <span className="section-badge">Fitur Unggulan</span>
          <h2>Dataset Terbaru</h2>

          <div className="dataset-grid" ref={datasetScrollerRef}>
            {latestDatasets.length === 0 ? (
              <div className="dataset-card dataset-card--empty">
                <h3>Belum ada dataset terbaru dari CKAN.</h3>
              </div>
            ) : null}

            {latestDatasets.map((dataset) => {
              const title = getDatasetTitle(dataset)

              return (
                <a
                  className={`dataset-card ${activeDatasetTitle === title ? "is-highlighted" : ""}`}
                  href={getDatasetUrl(dataset)}
                  key={dataset.id || dataset.name || title}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="dataset-card__thumb">
                    <img src={logoPortal} alt="" />
                  </div>
                  <h3>{title}</h3>
                  <div className="dataset-card__meta">
                    <span>{dataset.author || "Admin"}</span>
                    <span>{formatDatasetDate(getDatasetDateValue(dataset))}</span>
                  </div>
                </a>
              )
            })}
          </div>

          {latestDatasets.length > visibleDatasetCards ? (
            <div className="dataset-dots" aria-label="Navigasi dataset terbaru">
              {Array.from({ length: datasetDotCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  className={activeDatasetSlide === index ? "is-active" : ""}
                  aria-label={`Lihat dataset terbaru ${index + 1}`}
                  onClick={() => scrollToDatasetSlide(index)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
