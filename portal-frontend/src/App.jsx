import { useEffect, useState } from "react"
import "./styles/App.css"
import Header from "./components/Header"
import Home from "./pages/Home"
import HomeLogo from "./pages/HomeLogo"
import Organisasi from "./pages/Organisasi"
import Publikasi from "./pages/Publikasi"
import Topik from "./pages/Topik"
import Search from "./pages/Search"
import Dataset from "./pages/Dataset"
import Login from "./pages/Login"
import Footer from "./components/Footer"

function getInitialView() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"

  if (path === "/login") {
    return "login"
  }

  if (path === "/publikasi") {
    return "publikasi"
  }

  if (path === "/dataset") {
    return "dataset"
  }

  if (path === "/organisasi") {
    return "organisasi"
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
  const showDataset = () => navigate("/dataset", "dataset")
  const showOrganisasi = (orgSlug) => {
    if (typeof orgSlug === "string" && orgSlug) {
      navigate(`/organisasi?org=${orgSlug}`, "organisasi")
    } else {
      navigate("/organisasi", "organisasi")
    }
  }
  
  // Catatan: Fungsi ini ditambahkan agar saat card atau statistik diklik, 
  // aplikasi mem-passing parameter nama dataset ke halaman organisasi
  const showOrganisasiWithDataset = (dataset) => {
    const slug = dataset?.name || dataset?.id;
    if (slug) {
      navigate(`/organisasi?dataset=${slug}`, "organisasi")
    } else {
      showOrganisasi()
    }
  }
  const showPublikasi = () => navigate("/publikasi", "publikasi")
  
  // Catatan: Fungsi ini diubah agar bisa menerima nama topik 
  // dan membukanya secara otomatis di halaman Topik
  const showTopik = (topicLabel) => {
    if (typeof topicLabel === "string" && topicLabel) {
      navigate(`/topik?topik=${encodeURIComponent(topicLabel)}`, "topik")
    } else {
      navigate("/topik", "topik")
    }
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

  return (
    <>
      <Header
        currentView={viewMode}
        onLogoClick={showLogoView}
        onHomeClick={showDefault}
        onDatasetClick={showDataset}
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
            : viewMode === "dataset"
              ? <Dataset onHomeClick={showDefault} onDatasetClick={showOrganisasiWithDataset} />
            : viewMode === "search"
              ? <Search onHomeClick={showDefault} onOrganisasiClick={showOrganisasi} onPublikasiClick={showPublikasi} onSearchNavigate={showSearch} onDatasetClick={showOrganisasiWithDataset} />
              : <Home onOrganisasiClick={showOrganisasi} onPublikasiClick={showPublikasi} onSearchNavigate={showSearch} onDatasetClick={showOrganisasiWithDataset} onDatasetPageClick={showDataset} onTopikClick={showTopik} />}
      {viewMode !== "logo" && <Footer />}
    </>
  )
}

export default App
