import { useState } from "react"
import heroImage from "../assets/img/GambarKomputer.png"
import logoKominfo from "../assets/img/logokominfo.png"
import "../styles/pages/home-logo.css"

export default function HomeLogo({ onSearchNavigate }) {
  const [query, setQuery] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearchNavigate?.(query)
  }

  return (
    <section className="logo-home">
      <div className="container logo-home__inner">
        <div className="logo-home__left">
          <h1>
            <span className="logo-home__title-line">
              Tangerang <span>Satudata</span>
            </span>
            <span className="logo-home__title-location">Kota Tangerang</span>
          </h1>
          <p>Kemudahan dalam mengakses mencari data dengan cepat, tepat dan akurat.</p>

          <form className="logo-home__search" role="search" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Apa yang ingin anda cari?"
              aria-label="Cari data"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" aria-label="Search">
              ⌕
            </button>
          </form>
        </div>

        <div className="logo-home__right" aria-hidden="true">
          <img src={heroImage} alt="" />
          <span className="logo-home__code logo-home__code--one" />
          <span className="logo-home__code logo-home__code--two" />
          <span className="logo-home__code logo-home__code--three" />
        </div>
      </div>

      <div className="logo-home__bottom container">
        <p>Copyright © 2022 - 2026. Pemerintah Kota Tangerang.</p>
        <div className="logo-home__bottom-logos">
          <img src={logoKominfo} alt="Kominfo" />
        </div>
      </div>

      <button
        type="button"
        className="logo-home__scroll-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Kembali ke atas"
      >
        ^
      </button>
    </section>
  )
}
