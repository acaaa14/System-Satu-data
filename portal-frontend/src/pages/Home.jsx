import heroImage from "../assets/gammbarkomputer.png"
import logoPortal from "../assets/img/logologin.png"
import pemerintahImage from "../assets/img/GambarPemerintah.png"
import infrastrukturImage from "../assets/img/GambarInfrastruktur.png"
import ekonomiImage from "../assets/img/GambarEkonomi.png"
import sosialImage from "../assets/img/GambarSosialBudaya.png"
import covidImage from "../assets/img/GambarCovid-19.png"
import "../styles/pages/home.css"

const stats = [
  { icon: "🗄️", value: "1254", label: "Dataset" },
  { icon: "🏛️", value: "41", label: "Organisasi" },
  { icon: "🎯", value: "5", label: "Topik" },
  { icon: "📰", value: "111", label: "Publikasi" },
]

const topics = [
  { label: "Pemerintah", image: pemerintahImage },
  { label: "Infrastruktur", image: infrastrukturImage },
  { label: "Ekonomi", image: ekonomiImage },
  { label: "Sosial dan budaya", image: sosialImage },
  { label: "Covid-19", image: covidImage },
]

const datasets = [
  "Data Evaluasi Penyerapan Anggaran Per Program Pemerintah",
  "Data Evaluasi Penyerapan Anggaran Per Program Prioritas",
  "Data Evaluasi Penyerapan Anggaran Per Program Pembangunan",
]

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="home-hero__left">
            <h1>
              Tangerang <span>Satudata</span>
              <br />
              Kota Tangerang
            </h1>
            <p>Kemudahan dalam mengakses mencari data dengan cepat, tepat dan akurat.</p>

            <div className="home-hero__search" role="search">
              <input type="text" placeholder="Apa yang ingin anda cari?" aria-label="Cari data" />
              <button type="button" aria-label="Search">
                ⌕
              </button>
            </div>
          </div>

          <div className="home-hero__right" aria-hidden="true">
            <img src={heroImage} alt="" />
          </div>
        </div>

        <button type="button" className="home-scroll-top" aria-label="Kembali ke atas">
          ˄
        </button>
      </section>

      <section className="home-section home-section--stats">
        <div className="container">
          <span className="section-badge">Fitur Unggulan</span>
          <h2>Statistik Portal Data Kota Tangerang</h2>

          <div className="stats-bar">
            {stats.map((item) => (
              <article key={item.label} className="stats-bar__item">
                <span className="stats-bar__icon" aria-hidden="true">
                  {item.icon}
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

      <section className="home-section">
        <div className="container">
          <span className="section-badge">Fitur Unggulan</span>
          <h2>
            Telusuri Berdasarkan Berdasarkan
            <br />
            Group Atau Topik
          </h2>

          <div className="topic-strip">
            {topics.map((topic) => (
              <article key={topic.label} className="topic-strip__item">
                <div className="topic-strip__icon" aria-hidden="true">
                  <img src={topic.image} alt="" />
                </div>
                <span>{topic.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-section--cards">
        <div className="container">
          <span className="section-badge">Fitur Unggulan</span>
          <h2>Dataset Terbaru</h2>

          <div className="dataset-grid">
            {datasets.map((title) => (
              <article className="dataset-card" key={title}>
                <div className="dataset-card__thumb">
                  <img src={logoPortal} alt="Logo dataset" />
                </div>
                <h3>{title}</h3>
                <div className="dataset-card__meta">
                  <span>Admin</span>
                  <span>27 Maret, 2026</span>
                </div>
              </article>
            ))}
          </div>

          <div className="dataset-dots" aria-hidden="true">
            <span className="is-active" />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>
    </main>
  )
}
