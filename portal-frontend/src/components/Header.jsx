import logoPortal from "../assets/img/logologin.png"
import "../styles/css/Header.css"

export default function Header({ currentView, onLogoClick, onHomeClick, onOrganisasiClick }) {
  return (
    <header className="portal-header">
      <div className="container portal-header__inner">
        <button
          type="button"
          className="portal-header__brand"
          aria-label="Tangerang Satu Data"
          onClick={onLogoClick}
        >
          <img src={logoPortal} alt="Tangerang Satu Data" />
        </button>

        <nav className="portal-header__nav" aria-label="Main menu">
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
          <a href="#">Publikasi</a>
          <a href="#">Topik</a>
          <a href="#">Peta</a>
        </nav>

        <div className="portal-header__actions">
          <button className="portal-header__search" type="button" aria-label="Cari">
            ⌕
          </button>
          <button className="portal-header__login" type="button">
            Login
          </button>
        </div>
      </div>
    </header>
  )
}
