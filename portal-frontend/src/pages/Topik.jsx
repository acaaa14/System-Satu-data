import { useEffect, useMemo, useState } from "react"
import { fetchTopics } from "../utils/ckan"
import { getTopicMatchKey, topicDefinitions } from "../utils/topics"
import "../styles/pages/topik.css"

function formatTopicDate(value) {
  if (!value) {
    return "Belum ada pembaruan"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "Belum ada pembaruan"
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export default function Topik() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadTopikOrganizations() {
      setLoading(true)
      setError("")

      try {
        const result = await fetchTopics()

        if (isMounted) {
          setOrganizations(result)
        }
      } catch {
        if (isMounted) {
          setOrganizations([])
          setError("Gagal memuat data topik dari CKAN.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadTopikOrganizations()

    return () => {
      isMounted = false
    }
  }, [])

  const topics = useMemo(() => {
    // Lima topik utama tetap selalu ada di UI, tetapi isi datanya tetap diambil dari CKAN.
    const grouped = new Map()

    for (const definition of topicDefinitions) {
      grouped.set(definition.key, {
        id: definition.key,
        title: definition.title,
        image: definition.fallbackImage,
        datasetCount: 0,
        author: "CKAN",
        publishedAt: "Belum ada pembaruan",
      })
    }

    for (const organization of organizations) {
      const matchKey = getTopicMatchKey(organization)

      if (!matchKey || !grouped.has(matchKey)) {
        continue
      }

      const current = grouped.get(matchKey)
      const updatedAt = organization.metadata_modified || organization.created || null
      const imageUrl = organization.image_display_url || organization.image_url || ""

      grouped.set(matchKey, {
        ...current,
        id: organization.id || organization.name || matchKey,
        title: organization.title || organization.display_name || current.title,
        image: imageUrl || current.image,
        datasetCount: organization.package_count ?? current.datasetCount,
        author: "CKAN",
        publishedAt: formatTopicDate(updatedAt),
      })
    }

    return topicDefinitions
      .map((definition) => grouped.get(definition.key))
      .filter(Boolean)
  }, [organizations])

  return (
    <main className="topik-page">
      <section className="topik-hero">
        <div className="container topik-hero__content">
          <div>
            <h1>Topik</h1>
            <p>
              <button
                type="button"
                className="topik-breadcrumb-link"
                onClick={() => {
                  window.location.href = "/"
                }}
              >
                Home
              </button>
              <span>/</span> <strong>Topik</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="topik-listing">
        <div className="container topik-listing__inner">
          {error ? <div className="topik-state">{error}</div> : null}
          {!error && loading ? <div className="topik-state">Memuat data topik dari CKAN...</div> : null}

          {!error && !loading ? (
            <div className="topik-grid">
              {topics.map((topic) => (
                <article className="topik-card" key={topic.id}>
                  <div className="topik-card__thumb">
                    <img src={topic.image} alt={topic.title} />
                  </div>

                  <div className="topik-card__headline">
                    <h2>{topic.title}</h2>
                    <span>{topic.datasetCount} Dataset</span>
                  </div>

                  <div className="topik-card__meta">
                    <span className="topik-card__meta-item">
                      <i aria-hidden="true">◌</i>
                      {topic.author}
                    </span>
                    <span className="topik-card__divider" aria-hidden="true" />
                    <span className="topik-card__meta-item">
                      <i aria-hidden="true">◫</i>
                      {topic.publishedAt}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="topik-scroll-top"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ˄
        </button>
      </section>
    </main>
  )
}
