import { useEffect, useState } from "react"
import "./styles/App.css"
import Header from "./components/Header"
import Home from "./pages/Home"
import HomeLogo from "./pages/HomeLogo"
import Organisasi from "./pages/Organisasi"
import Publikasi from "./pages/Publikasi"
import Topik from "./pages/Topik"
import Search from "./pages/Search"
import Login from "./pages/Login"
import Admin from "./pages/Admin"
import Footer from "./components/Footer"

function getInitialView() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"

  if (path === "/login") {
    return "login"
  }

  if (path === "/admin") {
    return "admin"
  }

  if (path === "/publikasi") {
    return "publikasi"
  }

  if (path === "/topik") {
    return "topik"
  }

  if (path === "/pencarian") {
    return "search"
  }

  return "default"
}

function App() {
  const [viewMode, setViewMode] = useState(getInitialView)
  const navigate = (path, nextView) => {
    window.history.pushState({}, "", path)
    setViewMode(nextView)
  }

  useEffect(() => {
    const handlePopState = () => setViewMode(getInitialView())
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const showDefault = () => navigate("/", "default")
  const showLogoView = () => setViewMode("logo")
  const showOrganisasi = () => navigate("/organisasi", "organisasi")
  const showPublikasi = () => navigate("/publikasi", "publikasi")
  const showTopik = () => {
    window.location.href = "/topik"
  }
  const showSearch = (query = "") => {
    const params = new URLSearchParams()
    if (query.trim()) {
      params.set("q", query.trim())
    }

    const suffix = params.toString() ? `?${params.toString()}` : ""
    navigate(`/pencarian${suffix}`, "search")
  }

  if (viewMode === "login") {
    return <Login />
  }

  if (viewMode === "admin") {
    return <Admin />
  }

  return (
    <>
      <Header
        currentView={viewMode}
        onLogoClick={showLogoView}
        onHomeClick={showDefault}
        onOrganisasiClick={showOrganisasi}
        onPublikasiClick={showPublikasi}
        onTopikClick={showTopik}
      />
      {viewMode === "logo"
        ? <HomeLogo onSearchNavigate={showSearch} />
        : viewMode === "organisasi"
          ? <Organisasi />
          : viewMode === "publikasi"
            ? <Publikasi />
            : viewMode === "topik"
              ? <Topik />
            : viewMode === "search"
              ? <Search onHomeClick={showDefault} onOrganisasiClick={showOrganisasi} onPublikasiClick={showPublikasi} onSearchNavigate={showSearch} />
              : <Home onOrganisasiClick={showOrganisasi} onPublikasiClick={showPublikasi} onSearchNavigate={showSearch} />}
      {viewMode !== "logo" && <Footer />}
    </>
  )
}

export default App
