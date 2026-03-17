import { BrowserRouter, Routes, Route } from "react-router-dom"
import DatasetList from "./components/DatasetList"
import DatasetDetail from "./components/DatasetDetail"
import Login from "./pages/Login"
import Admin from "./pages/Admin"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<DatasetList />} />

        <Route path="/dataset/:id" element={<DatasetDetail />} />
        <Route path="/login" element={<Login/>}/>
        <Route path="/admin" element={<Admin/>}/>
      </Routes>

    </BrowserRouter>

  )

}

export default App