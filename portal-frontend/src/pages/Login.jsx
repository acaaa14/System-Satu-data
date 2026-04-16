import { useState } from "react"
import axios from "axios"
import API_BASE_URL from "../utils/api"
import logoPortal from "../assets/img/logologin.png"
import logoKominfo from "../assets/img/logokominfo.png"
import cityLogo from "../assets/img/LogoKotaTangerang.png"
import "../styles/pages/login.css"

function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    axios
      .post(`${API_BASE_URL}/api/login`, {
        username,
        password,
        rememberMe,
      })
      .then((res) => {
        localStorage.setItem("token", res.data.token)
        window.location.href = "/admin"
      })
      .catch(() => {
        setError("Login gagal. Periksa kembali username dan password Anda.")
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <section className="login-page">
      <div className="login-page__orb login-page__orb--left" aria-hidden="true" />
      <div className="login-page__orb login-page__orb--right" aria-hidden="true" />

      <div className="login-page__inner">
        <img src={logoPortal} alt="Tangerang Satu Data" className="login-page__logo" />

        <form className="login-panel" onSubmit={handleLogin}>
          <label className="login-field">
            <input
              className="login-field__input"
              placeholder="Masukkan NIP ..."
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="login-field login-field--password">
            <input
              type={showPassword ? "text" : "password"}
              className="login-field__input"
              placeholder="Masukkan Password ..."
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="login-field__toggle"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? "🙈" : "◔"}
            </button>
          </label>

          <label className="login-remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Ingat Saya</span>
          </label>

          {error ? <div className="login-error">{error}</div> : null}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

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
