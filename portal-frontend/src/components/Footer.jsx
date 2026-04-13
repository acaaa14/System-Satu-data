import logoPortal from "../assets/img/logologin.png"
import logoKominfo from "../assets/img/logokominfo.png"
import logoPpid from "../assets/img/logoppid.png"
import logoTanglive from "../assets/img/logotnglive.png"
import "../styles/css/footer.css"

export default function Footer() {
  return (
    <footer className="portal-footer">
      <div className="container portal-footer__content">
        <div className="portal-footer__brand">
          <img src={logoPortal} alt="Tangerang Satu Data" className="portal-footer__main-logo" />
          <h3>Portal Data Terpadu Pemerintah Kota Tangerang</h3>
          <p>Jl. Satria, Kota Tangerang, Indonesia 15111</p>
        </div>

        <div className="portal-footer__right">
          <div className="portal-footer__counter">
            <strong>3707</strong>
            <span>Total Pengunjung</span>
          </div>

          <div className="portal-footer__logos">
            <img src={logoKominfo} alt="Kominfo" />
            <img src={logoTanglive} alt="Tanglive" />
            <img src={logoPpid} alt="PPID" />
          </div>
        </div>
      </div>

      <div className="portal-footer__bottom">Copyright © 2026 Pemerintah Kota Tangerang.</div>
    </footer>
  )
}
