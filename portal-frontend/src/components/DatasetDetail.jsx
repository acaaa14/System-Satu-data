import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

function DatasetDetail(){

  const { id } = useParams()

  const [dataset,setDataset] = useState(null)
  const [preview, setPreview] = useState([])
  

  useEffect(()=>{

    axios.get(`http://localhost:8081/api/dataset/${id}`)
      .then(res=>{
        setDataset(res.data.result)
      })
      .catch(err=>{
        console.log(err)
      })

  },[id])
  useEffect(()=>{

  if(dataset && dataset.resources.length > 0){

    const resourceId = dataset.resources[0].id

    axios.get(`http://localhost:8081/api/preview/${resourceId}`)
      .then(res=>{
        setPreview(res.data.result.records)
      })
      .catch(err=>{
        console.log(err)
      })

  }

},[dataset])

  if(!dataset){
    return <p>Loading...</p>
  }

  return(

    <div className="container mt-5">

      <h2>{dataset.title}</h2>

      <p>{dataset.notes}</p>

      <h4>Resources</h4>
      <h4 className="mt-4">Preview Data</h4>

<table className="table table-bordered">

  <thead>
    <tr>
      {preview.length > 0 &&
        Object.keys(preview[0]).map((key)=>(
          <th key={key}>{key}</th>
        ))}
    </tr>
  </thead>

  <tbody>
    {preview.map((row,i)=>(
      <tr key={i}>
        {Object.values(row).map((val,j)=>(
          <td key={j}>{val}</td>
        ))}
      </tr>
    ))}
  </tbody>

</table>

      {dataset.resources.map((r)=>(
        <div key={r.id}>

          <p>{r.name}</p>

          <a
            href={r.url}
            className="btn btn-success"
          >
            Download
          </a>

        </div>
      ))}

    </div>

  )

}

export default DatasetDetail