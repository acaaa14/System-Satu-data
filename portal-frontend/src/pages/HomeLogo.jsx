import heroImage from "../assets/img/GambarKomputer.png"
import geospasialImage from "../assets/img/GambarGeospasial.png"
import statistikImage from "../assets/img/GambarStatistik.png"
import perencanaanImage from "../assets/img/GambarPerencanaanPenganggaran.png"
import logoKominfo from "../assets/img/logokominfo.png"
import "../styles/pages/home-logo.css"

const featureCards = [
  { image: geospasialImage, label: "Geospasial" },
  { image: statistikImage, label: "Statistik" },
  { image: perencanaanImage, label: "Perencanaan Penganggaran" },
]

export default function HomeLogo() {
  return (
    <section className="logo-home">
      <div className="container logo-home__inner">
        <div className="logo-home__left">
          <h1>
            Tangerang <span>Satudata</span>
            <br />
            Kota Tangerang
          </h1>
          <p>Kemudahan dalam mengakses mencari data dengan cepat, tepat dan akurat.</p>

          <div className="logo-home__features">
            {featureCards.map((item) => (
              <article key={item.label} className="logo-home__feature">
                <div className="logo-home__feature-icon" aria-hidden="true">
                  <img src={item.image} alt="" />
                </div>
                <span>{item.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="logo-home__right" aria-hidden="true">
          <img src={heroImage} alt="" />
        </div>
      </div>

      <div className="logo-home__bottom container">
        <p>Copyright © 2022 - 2026. Pemerintah Kota Tangerang.</p>
        <div className="logo-home__bottom-logos">
          <img src={logoKominfo} alt="Kominfo" />
        </div>
      </div>
    </section>
  )
}
