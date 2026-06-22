import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import cityLogo from "../assets/img/LogoKotaTangerang.png"
import calendarIcon from "../assets/img/kalender.png"
import { fetchDatasetById, fetchDatasets, fetchOrganizations, fetchPublications, fetchResourcePreviewResult } from "../utils/ckan"
import { CKAN_BASE_URL } from "../utils/ckanAuth"
import { normalizePortalOrganizations } from "../utils/portalSections"
import { exportToXLS, exportToXML, exportToJSON, exportToPDF } from "../utils/export"
import "../styles/pages/organisasi.css"

// Grafik diload belakangan agar bundle awal aplikasi tetap ringan.
const DatasetLineChart = lazy(() => import("../components/DatasetLineChart"))
// Kolom tahun standar dipakai untuk membetulkan DataStore lama yang header-nya rusak.
const YEAR_COLUMNS = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]
const DEFAULT_TABLE_COLUMNS = ["No", "Uraian", ...YEAR_COLUMNS, "Satuan", "Sumber Data", "Akses", "Waktu Release"]

// Mengubah tanggal dari CKAN ke format Indonesia agar lebih mudah dibaca.
function formatOrgDate(value) {
  if (!value) {
    return "Belum ada pembaruan"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "Belum ada pembaruan"
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getDatasetTitle(dataset) {
  return dataset.title || dataset.name || "Dataset tanpa judul"
}

function getResourceUrl(resource) {
  if (!resource?.url) {
    return "#"
  }

  if (/^https?:\/\//i.test(resource.url)) {
    return resource.url
  }

  return `${CKAN_BASE_URL.replace(/\/+$/, "")}${resource.url.startsWith("/") ? "" : "/"}${resource.url}`
}

// Format resource dari CKAN kadang ada di `format`, kadang di `mimetype`.
function getResourceFormat(resource) {
  return String(resource?.format || resource?.mimetype || "").toLowerCase()
}

// Mencari tombol download berdasarkan format file yang tersedia di resource CKAN.
function findResourceByFormat(dataset, format) {
  const expected = format.toLowerCase()

  return (dataset?.resources || []).find((resource) => {
    const resourceFormat = getResourceFormat(resource)
    const resourceName = String(resource?.name || resource?.url || "").toLowerCase()

    return resourceFormat.includes(expected) || resourceName.endsWith(`.${expected}`)
  })
}

// Resource DataStore diprioritaskan untuk tabel, lalu fallback ke format tabular.
function getPrimaryTableResource(dataset) {
  return (
    (dataset?.resources || []).find((resource) => resource.datastore_active) ||
    findResourceByFormat(dataset, "csv") ||
    findResourceByFormat(dataset, "xls") ||
    findResourceByFormat(dataset, "xlsx") ||
    findResourceByFormat(dataset, "json") ||
    dataset?.resources?.[0] ||
    null
  )
}

// Urutan field dari CKAN dipakai agar tabel tidak berubah-ubah mengikuti object key.
function getTableFieldIds(fields, records) {
  const fieldIds = (fields || [])
    .map((field) => field.id)
    .filter((fieldId) => fieldId && fieldId !== "_id")

  if (fieldIds.length) {
    return fieldIds
  }

  const keys = new Set()
  records.forEach((record) => {
    Object.keys(record || {})
      .filter((key) => key !== "_id")
      .forEach((key) => keys.add(key))
  })

  return Array.from(keys)
}

function hasYearColumns(columns) {
  return columns.some((column) => YEAR_COLUMNS.includes(String(column)))
}

function usesDataValuesAsHeaders(columns) {
  return columns.length >= DEFAULT_TABLE_COLUMNS.length && !hasYearColumns(columns)
}

// DataStore lama bisa memakai nilai baris pertama sebagai header, jadi disusun ulang.
function mapOrderedValuesToDefaultColumns(values) {
  return DEFAULT_TABLE_COLUMNS.reduce((row, column, index) => {
    row[column] = values[index] ?? "-"
    return row
  }, {})
}

// Menghasilkan struktur tabel final: normal jika header benar, diperbaiki jika header rusak.
function buildPreviewTable(fields, records) {
  const fieldIds = getTableFieldIds(fields, records)

  if (usesDataValuesAsHeaders(fieldIds)) {
    return {
      columns: DEFAULT_TABLE_COLUMNS,
      rows: [
        mapOrderedValuesToDefaultColumns(fieldIds),
        ...records.map((record) => mapOrderedValuesToDefaultColumns(fieldIds.map((fieldId) => record[fieldId]))),
      ],
    }
  }

  return {
    columns: fieldIds,
    rows: records,
  }
}

// Nilai tahun dari DataStore bisa memakai titik ribuan, sehingga perlu dinormalisasi.
function parseNumberValue(value) {
  if (typeof value === "number") {
    return value
  }

  const normalized = String(value ?? "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "")

  const numberValue = Number(normalized)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function getYearFromColumn(column) {
  const match = String(column || "").match(/(?:tahun\s*)?(\d{4})/i)
  return match?.[1] || ""
}

function normalizeYearValue(value) {
  const numberValue = parseNumberValue(value)

  if (Math.abs(numberValue) > 1000) {
    return numberValue / 1000
  }

  return numberValue
}

function formatDecimalValue(value) {
  const numberValue = normalizeYearValue(value)

  if (!Number.isFinite(numberValue)) {
    return value ?? "-"
  }

  if (Number.isInteger(numberValue)) {
    return new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(numberValue)
  }

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(numberValue)
}

function formatTableValue(column, value) {
  if (!getYearFromColumn(column)) {
    return value ?? "-"
  }

  return formatDecimalValue(value)
}

// Grafik hanya mengambil kolom dengan nama tahun, misalnya 2015 sampai 2025.
function buildChartData(record) {
  return Object.entries(record || {})
    .map(([key, value]) => ({
      year: getYearFromColumn(key),
      jumlah: normalizeYearValue(value),
    }))
    .filter((item) => item.year)
}

function normalizeComparableValue(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
}

function isRepeatedHeaderRow(row, columns) {
  if (!row || !columns.length) {
    return false
  }

  const comparableValues = columns.map((column) => normalizeComparableValue(row[column]))
  const comparableColumns = columns.map((column) => normalizeComparableValue(column))

  const matchingCells = comparableValues.filter((value, index) => value && value === comparableColumns[index]).length
  const yearHeaderCells = columns.filter((column) => {
    const year = getYearFromColumn(column)
    return year && normalizeComparableValue(row[column]).includes(year)
  }).length

  return matchingCells >= 2 || yearHeaderCells >= 3
}

function normalizeKey(value) {
  return String(value || "").toLowerCase().trim()
}

// Dataset difilter dengan mencocokkan id/name/title organisasi dari CKAN.
function datasetBelongsToOrganization(dataset, organization) {
  const organizationKeys = [
    organization.id,
    organization.name,
    organization.title,
    organization.raw?.id,
    organization.raw?.name,
    organization.raw?.title,
    organization.raw?.display_name,
  ].map(normalizeKey).filter(Boolean)

  const datasetOrganizationKeys = [
    dataset.organization?.id,
    dataset.organization?.name,
    dataset.organization?.title,
    dataset.organization?.display_name,
    dataset.owner_org,
  ].map(normalizeKey).filter(Boolean)

  return datasetOrganizationKeys.some((key) => organizationKeys.includes(key))
}

export default function Organisasi() {
  const [organizations, setOrganizations] = useState([])
  const [datasets, setDatasets] = useState([])
  const [selectedOrganization, setSelectedOrganization] = useState(null)
  const [selectedDataset, setSelectedDataset] = useState(null)
  const [previewRecords, setPreviewRecords] = useState([])
  const [previewFields, setPreviewFields] = useState([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState("")
  const [datasetSearch, setDatasetSearch] = useState("")
  const [activePage, setActivePage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    // Ambil data organisasi dari backend lalu rapikan field-nya agar aman dipakai di UI.
    async function loadOrganisasi() {
      setLoading(true)
      setError("")

      try {
        const [organizationResult, publicationResult, datasetResult] = await Promise.all([
          fetchOrganizations(),
          fetchPublications(),
          fetchDatasets(),
        ])

        const normalized = normalizePortalOrganizations(organizationResult, publicationResult)

        if (isMounted) {
          setOrganizations(normalized)
          setDatasets(datasetResult)

          // Catatan: Membaca parameter URL (contoh: ?dataset=nama-dataset) 
          // untuk membuka dataset tertentu secara otomatis saat halaman pertama kali dimuat.
          const params = new URLSearchParams(window.location.search)
          const datasetParam = params.get("dataset")
          if (datasetParam) {
            const targetDataset = datasetResult.find(d => d.name === datasetParam || d.id === datasetParam)
            if (targetDataset) {
              const targetOrg = normalized.find(o => datasetBelongsToOrganization(targetDataset, o))
              if (targetOrg) {
                setSelectedOrganization(targetOrg)
                setSelectedDataset(targetDataset)
              }
            }
          }
        }
      } catch {
        if (isMounted) {
          setError("Gagal memuat organisasi dari CKAN.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadOrganisasi()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadSelectedDataset() {
      if (!selectedDataset) {
        setPreviewRecords([])
        setPreviewFields([])
        setPreviewError("")
        setPreviewLoading(false)
        return
      }

      setPreviewLoading(true)
      setPreviewError("")

      try {
        // Detail dataset diperlukan agar daftar resource lengkap sebelum preview diambil.
        const detail = await fetchDatasetById(selectedDataset.name || selectedDataset.id)
        const mergedDataset = detail || selectedDataset
        const resource = getPrimaryTableResource(mergedDataset)
        // Preview result membawa `fields` dan `records` untuk tabel serta grafik.
        const previewResult = resource?.id ? await fetchResourcePreviewResult(resource.id) : { fields: [], records: [] }
        const records = previewResult.records || []

        if (isMounted) {
          setSelectedDataset(mergedDataset)
          setPreviewRecords(records)
          setPreviewFields(previewResult.fields || [])
          setPreviewError(records.length ? "" : "Data tabel belum tersedia di DataStore.")
        }
      } catch {
        if (isMounted) {
          setPreviewRecords([])
          setPreviewFields([])
          setPreviewError("Gagal memuat preview DataStore.")
        }
      } finally {
        if (isMounted) {
          setPreviewLoading(false)
        }
      }
    }

    loadSelectedDataset()

    return () => {
      isMounted = false
    }
  }, [selectedDataset?.id, selectedDataset?.name])

  const selectedDatasets = useMemo(() => {
    if (!selectedOrganization) {
      return []
    }

    return datasets
      .filter((dataset) => datasetBelongsToOrganization(dataset, selectedOrganization))
      .sort((left, right) => getDatasetTitle(left).localeCompare(getDatasetTitle(right)))
  }, [datasets, selectedOrganization])

  const visibleDatasets = useMemo(() => {
    const keyword = datasetSearch.toLowerCase().trim()

    if (!keyword) {
      return selectedDatasets
    }

    return selectedDatasets.filter((dataset) => {
      return [
        dataset.title,
        dataset.name,
        dataset.notes,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(keyword))
    })
  }, [datasetSearch, selectedDatasets])

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(visibleDatasets.length / pageSize))
  const currentPage = Math.min(activePage, totalPages)
  const pagedDatasets = visibleDatasets.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function selectOrganization(organization) {
    setSelectedOrganization(organization)
    setDatasetSearch("")
    setActivePage(1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function backToList() {
    setSelectedOrganization(null)
    setSelectedDataset(null)
    setDatasetSearch("")
    setActivePage(1)
    if (window.location.search) {
      window.history.replaceState({}, "", "/organisasi")
    }
  }

  function backToOrganizationDetail() {
    setSelectedDataset(null)
    setPreviewRecords([])
    setPreviewFields([])
    setPreviewError("")
    if (window.location.search) {
      window.history.replaceState({}, "", "/organisasi")
    }
  }

  // Membuka detail dataset tetap di halaman portal, bukan lompat ke CKAN langsung.
  function openDataset(dataset) {
    setSelectedDataset(dataset)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (selectedOrganization && selectedDataset) {
    // Tabel dinormalisasi dulu supaya kolom tahun selalu bisa dibaca grafik.
    const previewTable = buildPreviewTable(previewFields, previewRecords)
    const tableRows = previewTable.rows.filter((row) => !isRepeatedHeaderRow(row, previewTable.columns))
    const chartSourceRecord = tableRows[0] || {}
    const chartData = buildChartData(chartSourceRecord)
    const yearColumnCount = previewTable.columns.filter((column) => getYearFromColumn(column)).length
    const downloadFormats = ["xls", "xml", "pdf", "json"]
    const jsonDetailUrl = `${CKAN_BASE_URL.replace(/\/+$/, "")}/api/3/action/package_show?id=${selectedDataset.name || selectedDataset.id}`

    return (
      <main className="organisasi-page organisasi-page--detail">
        <section className="organisasi-dataset-detail">
          <div className="container organisasi-dataset-detail__inner">
            <nav className="organisasi-detail__breadcrumb" aria-label="Breadcrumb">
              <button type="button" onClick={() => { window.location.href = "/" }}>Beranda</button>
              <span>/</span>
              <button type="button" onClick={backToList}>Organisasi</button>
              <span>/</span>
              <button type="button" onClick={backToOrganizationDetail}>{selectedOrganization.title}</button>
              <span>/</span>
              <strong>{getDatasetTitle(selectedDataset)}</strong>
            </nav>

            <section className="organisasi-dataset-card">
              <header className="organisasi-dataset-card__header">
                <h1>{getDatasetTitle(selectedDataset)}</h1>
                <div className="organisasi-dataset-card__downloads">
                  <span>Download :</span>
                  {downloadFormats.map((format) => (
                    <a
                      href="#"
                      key={format}
                      onClick={(e) => {
                        e.preventDefault();
                        const title = getDatasetTitle(selectedDataset);
                        if (format === "xls") exportToXLS(previewTable.columns, tableRows, title);
                        if (format === "xml") exportToXML(previewTable.columns, tableRows, title);
                        if (format === "json") exportToJSON(previewTable.columns, tableRows, title);
                        if (format === "pdf") exportToPDF(previewTable.columns, tableRows, title);
                      }}
                    >
                      {format.toUpperCase()}
                    </a>
                  ))}
                  <a href={jsonDetailUrl} target="_blank" rel="noreferrer">JSON Detail</a>
                </div>
              </header>

              {previewLoading ? (
                <div className="organisasi-dataset-state">Memuat data tabel...</div>
              ) : previewError ? (
                <div className="organisasi-dataset-state">{previewError}</div>
              ) : (
                <div className="organisasi-dataset-table-wrap">
                  <table className="organisasi-dataset-table">
                    <thead>
                      <tr>
                        {previewTable.columns.map((column, index) => {
                          const year = getYearFromColumn(column)
                          const isFirstYearColumn =
                            year && !previewTable.columns.slice(0, index).some((item) => getYearFromColumn(item))

                          if (year) {
                            return isFirstYearColumn ? (
                              <th className="is-year-group" colSpan={yearColumnCount} key="tahun-ke">
                                Tahun Ke
                              </th>
                            ) : null
                          }

                          return (
                            <th rowSpan={yearColumnCount ? 2 : 1} key={column}>
                              {column}
                            </th>
                          )
                        })}
                      </tr>
                      {yearColumnCount ? (
                        <tr>
                          {previewTable.columns
                            .filter((column) => getYearFromColumn(column))
                            .map((column) => (
                              <th className="is-year-column" key={column}>
                                <span aria-hidden="true">›</span>
                                {getYearFromColumn(column)}
                              </th>
                            ))}
                        </tr>
                      ) : null}
                    </thead>
                    <tbody>
                      {tableRows.map((record, index) => (
                        <tr key={record._id || index}>
                          {previewTable.columns.map((column) => (
                            <td key={column}>{formatTableValue(column, record[column])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="organisasi-chart-card">
              <header>
                <h2>Grafik</h2>
              </header>
              {chartData.length > 0 ? (
                <div className="organisasi-chart-card__canvas">
                  <Suspense fallback={<div className="organisasi-dataset-state">Memuat grafik...</div>}>
                    <DatasetLineChart data={chartData} />
                  </Suspense>
                </div>
              ) : (
                <div className="organisasi-dataset-state">Grafik belum tersedia karena kolom tahun tidak ditemukan.</div>
              )}
            </section>
          </div>
        </section>
      </main>
    )
  }

  if (selectedOrganization) {
    return (
      <main className="organisasi-page organisasi-page--detail">
        <section className="organisasi-detail">
          <div className="container organisasi-detail__inner">
            <nav className="organisasi-detail__breadcrumb" aria-label="Breadcrumb">
              <button type="button" onClick={() => { window.location.href = "/" }}>Beranda</button>
              <span>/</span>
              <button type="button" onClick={backToList}>Organisasi</button>
              <span>/</span>
              <strong>{selectedOrganization.title}</strong>
            </nav>

            <div className="organisasi-detail__layout">
              <aside className="organisasi-detail__sidebar">
                <h1>Organisasi</h1>
                <div className="organisasi-detail__org-name">
                  <span>{selectedOrganization.title}</span>
                  <strong>{selectedDatasets.length}</strong>
                </div>
                <div className="organisasi-detail__logo">
                  <img src={selectedOrganization.imageUrl || cityLogo} alt={selectedOrganization.title} />
                </div>
              </aside>

              <section className="organisasi-detail__content">
                <div className="organisasi-detail__toolbar">
                  <h2>{visibleDatasets.length} Dataset ditemukan</h2>
                  <input
                    type="search"
                    value={datasetSearch}
                    placeholder="Cari"
                    aria-label="Cari dataset organisasi"
                    onChange={(event) => {
                      setDatasetSearch(event.target.value)
                      setActivePage(1)
                    }}
                  />
                </div>

                <div className="organisasi-detail__datasets">
                  {pagedDatasets.length > 0 ? (
                    pagedDatasets.map((dataset) => (
                      <button
                        type="button"
                        className="organisasi-detail__dataset-link"
                        key={dataset.id || dataset.name}
                        onClick={() => openDataset(dataset)}
                      >
                        {getDatasetTitle(dataset)}
                      </button>
                    ))
                  ) : (
                    <p className="organisasi-detail__empty">Tidak ada dataset yang cocok.</p>
                  )}
                </div>

                <div className="organisasi-detail__pagination" aria-label="Navigasi halaman dataset">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      type="button"
                      className={page === currentPage ? "is-active" : ""}
                      key={page}
                      onClick={() => setActivePage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  {currentPage < totalPages ? (
                    <button type="button" className="organisasi-detail__next" onClick={() => setActivePage(currentPage + 1)}>
                      Next ›
                    </button>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="organisasi-page">
      <section className="organisasi-hero">
        <div className="container organisasi-hero__content">
          <div>
            <h1>Organisasi</h1>
            <p>
              <button
                type="button"
                className="organisasi-breadcrumb-link"
                onClick={() => {
                  window.location.href = "/"
                }}
              >
                Home
              </button>
              <span>/</span> <strong>Organisasi</strong>
            </p>
          </div>
        </div>  
      </section>

      <section className="organisasi-listing">
        <div className="container organisasi-listing__inner">
          

          {error ? <div className="organisasi-state">{error}</div> : null}

          {!error && loading ? <div className="organisasi-state">Mengambil data organisasi dari CKAN...</div> : null}

          {!error && !loading && organizations.length === 0 ? (
            <div className="organisasi-state">Belum ada organisasi yang bisa ditampilkan.</div>
          ) : null}

          {!error && organizations.length > 0 ? (
            <div className="organisasi-grid">
              {organizations.map((organization) => (
                <button
                  type="button"
                  className="organisasi-card"
                  key={organization.id}
                  onClick={() => selectOrganization(organization)}
                >
                  <div className="organisasi-card__thumb">
                    {/* Jika CKAN punya logo organisasi, pakai itu. Kalau tidak, pakai logo fallback lokal. */}
                    <img src={organization.imageUrl || cityLogo} alt={organization.title} />
                  </div>

                  <h3>{organization.title}</h3>

                  <p className="organisasi-card__slug">{organization.name}</p>

                  <div className="organisasi-card__meta">
                    <span className="organisasi-card__meta-item">
                      <i aria-hidden="true">◌</i>
                      {organization.packageCount} dataset
                    </span>
                    <span className="organisasi-card__divider" aria-hidden="true" />
                    <span className="organisasi-card__meta-item">
                      <img className="organisasi-card__meta-icon" src={calendarIcon} alt="" aria-hidden="true" />
                      {formatOrgDate(organization.updatedAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="organisasi-scroll-top"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ˄
        </button>
      </section>
    </main>
  )
}
