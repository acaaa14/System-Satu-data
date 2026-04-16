import { useEffect, useState } from "react"
import logoPortal from "../assets/img/logologin.png"
import logoKominfo from "../assets/img/logokominfo.png"
import logoPpid from "../assets/img/logoppid.png"
import logoTanglive from "../assets/img/logotnglive.png"
import API_BASE_URL from "../utils/api"
import "../styles/css/footer.css"

const VISITOR_STORAGE_KEY = "portal-visitor-counted-at"
const VISITOR_COUNT_TTL = 24 * 60 * 60 * 1000

export default function Footer() {
  const [visitorTotal, setVisitorTotal] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function syncVisitors() {
      const lastCountedAt = Number(localStorage.getItem(VISITOR_STORAGE_KEY) || 0)
      const shouldIncrement = !lastCountedAt || Date.now() - lastCountedAt > VISITOR_COUNT_TTL
      const endpoint = shouldIncrement
        ? `${API_BASE_URL}/api/visitors/increment`
        : `${API_BASE_URL}/api/visitors`

      try {
        const response = await fetch(endpoint, {
          method: shouldIncrement ? "POST" : "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        const payload = await response.json()
        const total = Number(payload?.result?.total || 0)

        if (isMounted) {
          setVisitorTotal(total)
        }

        if (shouldIncrement) {
          localStorage.setItem(VISITOR_STORAGE_KEY, Date.now().toString())
        }
      } catch {
        if (isMounted) {
          setVisitorTotal(0)
        }
      }
    }

    syncVisitors()

    return () => {
      isMounted = false
    }
  }, [])

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
            <strong>{visitorTotal}</strong>
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
