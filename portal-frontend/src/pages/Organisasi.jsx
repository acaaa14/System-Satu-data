import organisasiImage from "../assets/img/GambarOrganisasi.png"
import cityLogo from "../assets/img/LogoKotaTangerang.png"
import "../styles/pages/organisasi.css"

const organisasiItems = [
  "Data Evaluasi Penyerapan Anggaran Per Program Pemerintah",
  "Data Evaluasi Penyerapan Anggaran Per Program Prioritas",
  "Data Evaluasi Penyerapan Anggaran Per Program Pembangunan",
  "Data Evaluasi Penyerapan Anggaran Per Bidang Pelayanan",
  "Data Evaluasi Penyerapan Anggaran Per Kegiatan Strategis",
  "Data Evaluasi Penyerapan Anggaran Per Urusan Pemerintahan",
  "Data Evaluasi Penyerapan Anggaran Per Target Kinerja",
  "Data Evaluasi Penyerapan Anggaran Per Sasaran Program",
  "Data Evaluasi Penyerapan Anggaran Per Unit Pelaksana",
]

export default function Organisasi() {
  return (
    <main className="organisasi-page">
      <section className="organisasi-hero">
        <div className="container organisasi-hero__content">
          <img src={organisasiImage} alt="" className="organisasi-hero__illustration" aria-hidden="true" />
          <div>
            <h1>Organisasi</h1>
            <p>
              Home <span>/</span> <strong>Organisasi</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="organisasi-listing">
        <div className="container organisasi-listing__inner">
          <div className="organisasi-grid">
            {organisasiItems.map((title) => (
              <article className="organisasi-card" key={title}>
                <div className="organisasi-card__thumb">
                  <img src={cityLogo} alt="Logo Kota Tangerang" />
                </div>

                <h3>{title}</h3>

                <div className="organisasi-card__meta">
                  <span className="organisasi-card__meta-item">
                    <i aria-hidden="true">◌</i>
                    Admin
                  </span>
                  <span className="organisasi-card__divider" aria-hidden="true" />
                  <span className="organisasi-card__meta-item">
                    <i aria-hidden="true">◫</i>
                    27 Maret, 2026
                  </span>
                </div>
              </article>
            ))}
          </div>
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
