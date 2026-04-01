import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"

function DatasetDetail() {
  const { id } = useParams()

  const [dataset, setDataset] = useState(null)
  const [preview, setPreview] = useState([])

  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/dataset/${id}`)
      .then((res) => {
        setDataset(res.data.result)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [id])

  useEffect(() => {
    if (dataset && dataset.resources.length > 0) {
      const resourceId = dataset.resources[0].id

      axios
        .get(`http://localhost:8081/api/preview/${resourceId}`)
        .then((res) => {
          setPreview(res.data.result.records)
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [dataset])

  if (!dataset) {
    return (
      <div className="portal-detail-shell">
        <div className="portal-empty-state">Memuat detail dataset Tangerang...</div>
      </div>
    )
  }

  return (
    <div className="portal-detail-shell">
      <section className="portal-detail-hero">
        <div>
          <a href="/" className="portal-detail-back">
            Kembali ke portal
          </a>
          <div className="portal-hero__badge">Detail Dataset</div>
          <h1>{dataset.title}</h1>
          <p>{dataset.notes || "Dataset ini belum memiliki deskripsi tambahan."}</p>
        </div>

        <div className="portal-detail-hero__meta">
          <div>
            <span>Organisasi</span>
            <strong>{dataset.organization?.title || "Tanpa organisasi"}</strong>
          </div>
          <div>
            <span>Jumlah Resource</span>
            <strong>{dataset.resources.length}</strong>
          </div>
          <div>
            <span>Slug Dataset</span>
            <strong>{dataset.name}</strong>
          </div>
        </div>
      </section>

      <section className="portal-detail-grid">
        <article className="portal-detail-panel">
          <div className="portal-section-heading">
            <div>
              <h2>Resource Dataset</h2>
              <p>Unduh file atau lanjutkan eksplorasi dari sumber data yang tersedia.</p>
            </div>
          </div>

          <div className="portal-resource-list">
            {dataset.resources.map((resource) => (
              <div className="portal-resource-card" key={resource.id}>
                <div>
                  <h3>{resource.name || "Resource tanpa nama"}</h3>
                  <p>{resource.format || "Format belum tersedia"}</p>
                </div>
                <a href={resource.url} className="btn btn-success portal-card-button">
                  Download
                </a>
              </div>
            ))}
          </div>
        </article>

        <article className="portal-detail-panel">
          <div className="portal-section-heading">
            <div>
              <h2>Preview Data</h2>
              <p>Tampilan cepat untuk melihat struktur data dari resource pertama.</p>
            </div>
          </div>

          {preview.length === 0 ? (
            <div className="portal-empty-state">
              Preview belum tersedia untuk resource pertama pada dataset ini.
            </div>
          ) : (
            <div className="portal-preview-table-wrap">
              <table className="table portal-preview-table">
                <thead>
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {preview.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  )
}

export default DatasetDetail
