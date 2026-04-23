import { useEffect, useState } from "react"
import cityLogo from "../assets/img/LogoKotaTangerang.png"
import calendarIcon from "../assets/img/kalender.png"
import { fetchOrganizations, fetchPublications } from "../utils/ckan"
import { normalizePortalOrganizations } from "../utils/portalSections"
import "../styles/pages/organisasi.css"

// Mengubah tanggal dari CKAN ke format Indonesia agar lebih mudah dibaca.
function formatOrgDate(value) {
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

export default function Organisasi() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    // Ambil data organisasi dari backend lalu rapikan field-nya agar aman dipakai di UI.
    async function loadOrganisasi() {
      setLoading(true)
      setError("")

      try {
        const [organizationResult, publicationResult] = await Promise.all([
          fetchOrganizations(),
          fetchPublications(),
        ])

        const normalized = normalizePortalOrganizations(organizationResult, publicationResult)

        if (isMounted) {
          setOrganizations(normalized)
        }
      } catch {
        if (isMounted) {
          setError("Gagal memuat organisasi dari CKAN.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOrganisasi()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="organisasi-page">
      <section className="organisasi-hero">
        <div className="container organisasi-hero__content">
          <div>
            <h1>Organisasi</h1>
            <p>
              <button
                type="button"
                className="organisasi-breadcrumb-link"
                onClick={() => {
                  window.location.href = "/"
                }}
              >
                Home
              </button>
              <span>/</span> <strong>Organisasi</strong>
            </p>
          </div>
        </div>  
      </section>

      <section className="organisasi-listing">
        <div className="container organisasi-listing__inner">
          

          {error ? <div className="organisasi-state">{error}</div> : null}

          {!error && loading ? <div className="organisasi-state">Mengambil data organisasi dari CKAN...</div> : null}

          {!error && !loading && organizations.length === 0 ? (
            <div className="organisasi-state">Belum ada organisasi yang bisa ditampilkan.</div>
          ) : null}

          {!error && organizations.length > 0 ? (
            <div className="organisasi-grid">
              {organizations.map((organization) => (
                <article className="organisasi-card" key={organization.id}>
                  <div className="organisasi-card__thumb">
                    {/* Jika CKAN punya logo organisasi, pakai itu. Kalau tidak, pakai logo fallback lokal. */}
                    <img src={organization.imageUrl || cityLogo} alt={organization.title} />
                  </div>

                  <h3>{organization.title}</h3>

                  <p className="organisasi-card__slug">{organization.name}</p>

                  <div className="organisasi-card__meta">
                    <span className="organisasi-card__meta-item">
                      <i aria-hidden="true">◌</i>
                      {organization.packageCount} dataset
                    </span>
                    <span className="organisasi-card__divider" aria-hidden="true" />
                    <span className="organisasi-card__meta-item">
                      <img className="organisasi-card__meta-icon" src={calendarIcon} alt="" aria-hidden="true" />
                      {formatOrgDate(organization.updatedAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="organisasi-scroll-top"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ˄
        </button>
      </section>
    </main>
  )
}
