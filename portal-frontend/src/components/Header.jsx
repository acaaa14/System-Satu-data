import logoPortal from "../assets/img/logologin.png"
import { CKAN_LOGIN_URL } from "../utils/ckanAuth"
import "../styles/css/Header.css"

export default function Header({
  currentView,
  onLogoClick,
  onHomeClick,
  onOrganisasiClick,
  onPublikasiClick,
  onTopikClick,
}) {
  return (
    <header className="portal-header">
      <div className="container portal-header__inner">
        {/* Klik logo diarahkan ke tampilan logo/landing khusus. */}
        <button
          type="button"
          className="portal-header__brand"
          aria-label="Tangerang Satu Data"
          onClick={onLogoClick}
        >
          <img src={logoPortal} alt="Tangerang Satu Data" />
        </button>

        <nav className="portal-header__nav" aria-label="Main menu">
          {/* currentView dipakai untuk memberi penanda menu yang sedang aktif. */}
          <button
            type="button"
            className={`portal-header__nav-btn ${currentView === "default" ? "is-active" : ""}`}
            onClick={onHomeClick}
          >
            Beranda
          </button>
          <button
            type="button"
            className={`portal-header__nav-link ${currentView === "organisasi" ? "is-active" : ""}`}
            onClick={onOrganisasiClick}
          >
            Organisasi
          </button>
          <button
            type="button"
            className={`portal-header__nav-link ${currentView === "publikasi" ? "is-active" : ""}`}
            onClick={onPublikasiClick}
          >
            Publikasi
          </button>
          <button
            type="button"
            className={`portal-header__nav-link ${currentView === "topik" ? "is-active" : ""}`}
            onClick={onTopikClick}
          >
            Topik
          </button>
          <button
            type="button"
            className="portal-header__nav-link"
            onClick={() => window.open("https://maps.tangerangkota.go.id/", "_blank", "noreferrer")}
          >
            Peta
          </button>
        </nav>

        <div className="portal-header__actions">
          {/* Tombol aksi tambahan ini masih placeholder dan bisa dihubungkan ke fitur berikutnya. */}
          <button className="portal-header__search" type="button" aria-label="Cari">
            ⌕
          </button>
          <button
            className="portal-header__login"
            type="button"
            onClick={() => {
              window.location.href = CKAN_LOGIN_URL
            }}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  )
}
