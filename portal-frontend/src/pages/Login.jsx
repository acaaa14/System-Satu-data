import { useEffect, useState } from "react"
import logoPortal from "../assets/img/logologin.png"
import logoKominfo from "../assets/img/logokominfo.png"
import cityLogo from "../assets/img/LogoKotaTangerang.png"
import { CKAN_LOGIN_URL } from "../utils/ckanAuth"
import "../styles/pages/login.css"

function Login() {
  const [statusMessage, setStatusMessage] = useState("Mengarahkan ke login CKAN...")

  useEffect(() => {
    window.location.href = CKAN_LOGIN_URL
  }, [])

  return (
    <section className="login-page">
      <div className="login-page__orb login-page__orb--left" aria-hidden="true" />
      <div className="login-page__orb login-page__orb--right" aria-hidden="true" />

      <div className="login-page__inner">
        <img src={logoPortal} alt="Tangerang Satu Data" className="login-page__logo" />

        <div className="login-panel">
          <p className="login-error" style={{ marginBottom: 16 }}>
            {statusMessage}
          </p>
          <button
            className="login-submit"
            type="button"
            onClick={() => {
              window.location.href = CKAN_LOGIN_URL
            }}
          >
            Buka Login CKAN
          </button>
        </div>

        <div className="login-page__footer">
          <p>
            <strong>Copyright © 2022 - 2026.</strong> Pemerintah Kota Tangerang.
          </p>

          <div className="login-page__support">
            <img src={logoKominfo} alt="Kominfo" />
            <img src={cityLogo} alt="Kota Tangerang" />
          </div>
        </div>
      </div>

      <div className="login-page__landscape" aria-hidden="true">
        <div className="login-page__skyline" />
        <div className="login-page__ground" />
        <div className="login-page__water" />
      </div>
    </section>
  )
}

export default Login
