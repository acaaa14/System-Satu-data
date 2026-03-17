import axios from "axios"
import { useEffect, useState } from "react"

function DatasetList(){

  const [datasets,setDatasets] = useState([])
  const [search, setSearch] = useState("")

  useEffect(()=>{

  const url = search
    ? `http://localhost:8081/api/search?q=${search}`
    : "http://localhost:8081/api/datasets"

  axios.get(url)
    .then(res=>{
      setDatasets(res.data.result.results)
    })
    .catch(err=>{
      console.log(err)
    })

},[search])

 return(

  <div>

    {/* ================= HERO ================= */}
    <div className="bg-primary text-white text-center p-5 mb-5">

      <h1>Portal Data Kota Tangerang</h1>

      <p>Akses dataset pemerintah secara terbuka</p>

      <input
        type="text"
        className="form-control mt-4"
        placeholder="Cari dataset..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />

    </div>


    {/* ================= STATISTIK ================= */}
    <div className="container">

      <div className="row text-center mb-4">

        <div className="col">
          <h3>{datasets.length}</h3>
          <p>Dataset</p>
        </div>

        <div className="col">
          <h3>1</h3>
          <p>Organisasi</p>
        </div>

        <div className="col">
          <h3>
            {datasets.reduce((acc,d)=>acc + d.num_resources,0)}
          </h3>
          <p>Resource</p>
        </div>

      </div>

    </div>


    {/* ================= DATASET LIST ================= */}
    <div className="container">

      <div className="row">

        {datasets.map((d)=>(

          <div className="col-md-4 mb-4" key={d.id}>

            <div className="card shadow-lg border-0 h-100">

              <div className="card-body">

                <h5 className="fw-bold">{d.title}</h5>

                <p className="text-muted">
                  {d.notes || "Tidak ada deskripsi"}
                </p>

                <a
                  href={`/dataset/${d.name}`}
                  className="btn btn-primary w-100"
                >
                  Lihat Dataset
                </a>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  </div>

)
}

export default DatasetList
