import { useEffect, useState } from "react"
import axios from "axios"
import API_BASE_URL from "../utils/api"
import logoPortal from "../assets/img/logologin.png"
import logoKominfo from "../assets/img/logokominfo.png"
import cityLogo from "../assets/img/LogoKotaTangerang.png"
import { CKAN_LOGIN_URL } from "../utils/ckanAuth"
import "../styles/pages/login.css"

function Login() {
  const [statusMessage, setStatusMessage] = useState("Mengarahkan ke login CKAN...")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shouldSync = params.get("sync") === "ckan"

    if (!shouldSync) {
      window.location.href = CKAN_LOGIN_URL
      return
    }

    setStatusMessage("Memverifikasi session CKAN dan menyinkronkan akses portal...")

    axios
      .post(`${API_BASE_URL}/api/auth/ckan/sync`)
      .then((response) => {
        if (response.data?.token) {
          localStorage.setItem("token", response.data.token)
          window.location.href = "/admin"
          return
        }

        setStatusMessage("Session CKAN tidak berhasil disinkronkan. Silakan login ulang.")
      })
      .catch(() => {
        setStatusMessage("Session CKAN belum valid. Silakan login ulang melalui CKAN.")
      })
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
