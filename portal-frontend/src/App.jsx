import { useState } from "react"
import "./styles/App.css"
import Header from "./components/Header"
import Home from "./pages/Home"
import HomeLogo from "./pages/HomeLogo"
import Organisasi from "./pages/Organisasi"
import Footer from "./components/Footer"

function App() {
  const [viewMode, setViewMode] = useState("default")

  const showDefault = () => setViewMode("default")
  const showLogoView = () => setViewMode("logo")
  const showOrganisasi = () => setViewMode("organisasi")

  return (
    <>
      <Header
        currentView={viewMode}
        onLogoClick={showLogoView}
        onHomeClick={showDefault}
        onOrganisasiClick={showOrganisasi}
      />
      {viewMode === "logo" ? <HomeLogo /> : viewMode === "organisasi" ? <Organisasi /> : <Home />}
      {viewMode !== "logo" && <Footer />}
    </>
  )
}

export default App
