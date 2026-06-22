import { useEffect, useMemo, useState } from "react"
import { fetchDatasets, fetchOrganizations } from "../utils/ckan"
import "../styles/pages/dataset.css"

function getDatasetTitle(dataset) {
  return dataset.title || dataset.name || "Dataset tanpa judul"
}

export default function Dataset({ onHomeClick, onDatasetClick })


{
  const [searchQuery, setSearchQuery] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [currentPage, setCurrentPage] = useState(1)
  const [datasets, setDatasets] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setLoading(true)
      try {
        const [datasetResult, organizationResult] = await Promise.all([
          fetchDatasets(),
          fetchOrganizations(),
        ])
        
        if (isMounted) {
          setDatasets(datasetResult)
          setOrganizations(organizationResult)
        }
      } catch (error) {
        if (isMounted) {
          setDatasets([])
          setOrganizations([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredDatasets = useMemo(() => {
    const keyword = searchQuery.toLowerCase().trim()
    if (!keyword) return datasets

    return datasets.filter((dataset) => {
      const title = getDatasetTitle(dataset).toLowerCase()
      const org = (dataset.organization?.title || "").toLowerCase()
      const notes = (dataset.notes || "").toLowerCase()
      return title.includes(keyword) || org.includes(keyword) || notes.includes(keyword)
    })
  }, [datasets, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredDatasets.length / itemsPerPage))
  const paginatedDatasets = filteredDatasets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  // Get unique resource formats for a dataset
  const getResourceFormats = (dataset) => {
    const formats = new Set()
    const resources = dataset.resources || []
    resources.forEach(res => {
      const format = String(res.format || res.mimetype || "").toLowerCase()
      if (format.includes("xls")) formats.add("XLS")
      else if (format.includes("xml")) formats.add("XML")
      else if (format.includes("pdf")) formats.add("PDF")
      else if (format.includes("json") || format.includes("geojson")) formats.add("JSON")
      else if (format.includes("csv")) formats.add("CSV")
      else if (format) formats.add(format.toUpperCase())
    })
    
    // If empty but has datastore_active, assume JSON/CSV available maybe? 
    // Let's just return standard formats based on portal export formats if it's datastore active
    if (formats.size === 0 && resources.some(r => r.datastore_active)) {
      return ["XLS", "XML", "PDF", "JSON"]
    }
    
    return Array.from(formats)
  }

  return (
    <main className="dataset-list-page">
      <section className="dataset-list-hero">
        <div className="container dataset-list-hero__content">
          <h1>Dataset</h1>
          <nav className="dataset-list-breadcrumb" aria-label="Breadcrumb">
            <button type="button" onClick={onHomeClick}>Home</button>
            <span>/</span>
            <strong>Dataset</strong>
          </nav>
          
          <div className="dataset-list-search-wrapper">
            <div className="dataset-list-search">
              <input
                type="text"
                placeholder="Masukkan Kata Kunci Pencarian"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button type="button" aria-label="Cari">
                ⌕
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="dataset-list-content">
        <div className="container">
          <div className="dataset-list-toolbar">
            <div className="dataset-list-filter">
              <span>Tampilkan</span>
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>Data</span>
            </div>
          </div>

          <div className="dataset-list-summary">
            {loading ? (
              <h2>Memuat data...</h2>
            ) : (
              <h2>{filteredDatasets.length} Dataset ditemukan</h2>
            )}
          </div>

          <div className="dataset-list-items">
            {!loading && paginatedDatasets.map((dataset) => {
              const formats = getResourceFormats(dataset)
              const orgTitle = dataset.organization?.title || "Organisasi tidak diketahui"
              
              return (
                <article className="dataset-list-item" key={dataset.id || dataset.name}>
                  <button 
                    type="button" 
                    className="dataset-list-item__title"
                    onClick={() => onDatasetClick?.(dataset)}
                  >
                    {getDatasetTitle(dataset)}
                  </button>
                  <p className="dataset-list-item__org">{orgTitle}</p>
                  
                  {formats.length > 0 && (
                    <div className="dataset-list-item__formats">
                      {formats.map((format, idx) => (
                        <span key={idx} className="dataset-format-badge">{format}</span>
                      ))}
                    </div>
                  )}
                </article>
              )
            })}
            
            {!loading && filteredDatasets.length === 0 && (
              <div className="dataset-list-empty">
                Belum ada dataset yang sesuai dengan pencarian.
              </div>
            )}
          </div>

          {!loading && totalPages > 1 && (
            <div className="dataset-list-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={currentPage === page ? "is-active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
