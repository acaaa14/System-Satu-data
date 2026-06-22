import { lazy, Suspense, useEffect, useMemo, useState } from "react"

import {
  fetchTopics,
  fetchGroupDatasets,
  fetchDatasetById,
  fetchResourcePreviewResult,
} from "../utils/ckan"

import {
  getTopicMatchKey,
  topicDefinitions,
} from "../utils/topics"
import { CKAN_BASE_URL } from "../utils/ckanAuth"
import { exportToXLS, exportToXML, exportToJSON, exportToPDF } from "../utils/export"

import "../styles/pages/topik.css"

const DatasetLineChart = lazy(() => import("../components/DatasetLineChart"))
const YEAR_COLUMNS = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"]
const DEFAULT_TABLE_COLUMNS = ["No", "Uraian", ...YEAR_COLUMNS, "Satuan", "Sumber Data", "Akses", "Waktu Release"]

function formatTopicDate(value) {
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
  return dataset?.title || dataset?.name || "Dataset tanpa judul"
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

function getResourceFormat(resource) {
  return String(resource?.format || resource?.mimetype || "").toLowerCase()
}

function findResourceByFormat(dataset, format) {
  const expected = format.toLowerCase()

  return (dataset?.resources || []).find((resource) => {
    const resourceFormat = getResourceFormat(resource)
    const resourceName = String(resource?.name || resource?.url || "").toLowerCase()

    return resourceFormat.includes(expected) || resourceName.endsWith(`.${expected}`)
  })
}

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

function mapOrderedValuesToDefaultColumns(values) {
  return DEFAULT_TABLE_COLUMNS.reduce((row, column, index) => {
    row[column] = values[index] ?? "-"
    return row
  }, {})
}

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

export default function Topik() {
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [selectedTopic, setSelectedTopic] = useState(null)
  const [datasets, setDatasets] = useState([])
  const [selectedDataset, setSelectedDataset] = useState(null)

  const [previewFields, setPreviewFields] = useState([])
  const [previewRecords, setPreviewRecords] = useState([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadTopikOrganizations() {
      setLoading(true)
      setError("")

      try {
        const result = await fetchTopics()

        if (isMounted) {
          setOrganizations(result)
        }
      } catch {
        if (isMounted) {
          setOrganizations([])
          setError("Gagal memuat data topik dari CKAN.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadTopikOrganizations()

    return () => {
      isMounted = false
    }
  }, [])

  const topics = useMemo(() => {
    const grouped = new Map()

    for (const definition of topicDefinitions) {
      grouped.set(definition.key, {
        id: definition.key,
        title: definition.title,
        image: definition.fallbackImage,
        datasetCount: 0,
        author: "CKAN",
        publishedAt: "Belum ada pembaruan",
      })
    }

    for (const organization of organizations) {
      const matchKey = getTopicMatchKey(organization)

      if (!matchKey || !grouped.has(matchKey)) {
        continue
      }

      const current = grouped.get(matchKey)

      const updatedAt =
        organization.metadata_modified ||
        organization.created ||
        null

      const imageUrl =
        organization.image_display_url ||
        organization.image_url ||
        ""

      grouped.set(matchKey, {
        ...current,
        id: organization.id || organization.name || matchKey,
        name: organization.name,
        title:
          organization.title ||
          organization.display_name ||
          current.title,
        image: imageUrl || current.image,
        datasetCount:
          organization.package_count ??
          current.datasetCount,
        author: "CKAN",
        publishedAt: formatTopicDate(updatedAt),
      })
    }

    return topicDefinitions
      .map((definition) => grouped.get(definition.key))
      .filter(Boolean)
  }, [organizations])

  // Catatan: Membaca parameter URL (contoh: ?topik=Pemerintah) 
  // untuk membuka daftar dataset topik tertentu secara otomatis
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const topicParam = params.get("topik")
    
    if (topicParam && topics.length > 0 && !selectedTopic) {
      const targetTopic = topics.find(t => t.title.toLowerCase() === topicParam.toLowerCase() || t.id.toLowerCase() === topicParam.toLowerCase())
      if (targetTopic) {
        openTopic(targetTopic)
      }
    }
  }, [topics, selectedTopic])

  async function openTopic(topic) {
    setSelectedTopic(topic)

    try {
      const groupName = topic.name || topic.id
      if (!groupName) throw new Error("No group name")
      const result = await fetchGroupDatasets(groupName)

      setDatasets(result)
    } catch {
      setDatasets([])
    }
  }

  function openDataset(dataset) {
    setSelectedDataset(dataset)
  }

  useEffect(() => {
    let isMounted = true

    async function loadPreview() {
      if (!selectedDataset) {
        setPreviewFields([])
        setPreviewRecords([])
        setPreviewError("")
        setPreviewLoading(false)
        return
      }

      setPreviewLoading(true)
      setPreviewError("")

      try {
        const detail = await fetchDatasetById(
          selectedDataset.name || selectedDataset.id,
        )

        const datasetForPreview = detail || selectedDataset
        const resource = getPrimaryTableResource(datasetForPreview)

        if (!resource?.id) {
          if (isMounted) {
            setPreviewFields([])
            setPreviewRecords([])
            setPreviewError("Resource tabel belum tersedia.")
          }
          return
        }

        const preview =
          await fetchResourcePreviewResult(resource.id)

        if (isMounted) {
          setPreviewFields(preview.fields || [])
          setPreviewRecords(preview.records || [])
          setPreviewError((preview.records || []).length ? "" : "Data tabel belum tersedia di DataStore.")
        }
      } catch {
        if (isMounted) {
          setPreviewFields([])
          setPreviewRecords([])
          setPreviewError("Gagal memuat preview DataStore.")
        }
      } finally {
        if (isMounted) {
          setPreviewLoading(false)
        }
      }
    }

    loadPreview()

    return () => {
      isMounted = false
    }
  }, [selectedDataset])

  // DETAIL TOPIK
  if (selectedTopic && !selectedDataset) {
    return (
      <main className="topik-page">

        <section className="topik-listing">

          <div className="container topik-detail-layout">

            <aside className="topik-sidebar">

              <h2>Topik</h2>

              {topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  className={
                    selectedTopic?.id === topic.id || selectedTopic?.title === topic.title
                      ? "topik-sidebar-item active"
                      : "topik-sidebar-item"
                  }
                  onClick={() => openTopic(topic)}
                >
                  <span>{topic.title}</span>

                  <strong>
                    {topic.datasetCount}
                  </strong>
                </button>
              ))}

            </aside>

            <section className="topik-content">

              <div className="topik-count">
                {datasets.length} Dataset ditemukan
              </div>

              <div className="topik-dataset-list">

                {datasets.map((dataset) => (
                  <article
                    key={dataset.id}
                    className="topik-dataset-card"
                  >

                    <button
                      type="button"
                      className="topik-dataset-title"
                      onClick={() => openDataset(dataset)}
                    >
                      {dataset.title}
                    </button>

                    <p>
                      {dataset.organization?.title}
                    </p>

                  </article>
                ))}

              </div>

            </section>

          </div>

        </section>

      </main>
    )
  }

  // DETAIL DATASET
  if (selectedTopic && selectedDataset) {
    const previewTable = buildPreviewTable(previewFields, previewRecords)
    const tableRows = previewTable.rows.filter((row) => !isRepeatedHeaderRow(row, previewTable.columns))
    const chartSourceRecord = tableRows[0] || {}
    const chartData = buildChartData(chartSourceRecord)
    const yearColumnCount = previewTable.columns.filter((column) => getYearFromColumn(column)).length
    const downloadFormats = ["xls", "xml", "pdf", "json"]
    const jsonDetailUrl = `${CKAN_BASE_URL.replace(/\/+$/, "")}/api/3/action/package_show?id=${selectedDataset.name || selectedDataset.id}`

    return (
      <main className="topik-page topik-page--detail">
        <section className="topik-dataset-detail">
          <div className="container topik-dataset-detail__inner">
            <nav className="topik-detail__breadcrumb" aria-label="Breadcrumb">
              <button type="button" onClick={() => { window.location.href = "/" }}>Beranda</button>
              <span>/</span>
              <button type="button" onClick={() => setSelectedDataset(null)}>Topik</button>
              <span>/</span>
              <button type="button" onClick={() => setSelectedDataset(null)}>{selectedTopic.title}</button>
              <span>/</span>
              <strong>{getDatasetTitle(selectedDataset)}</strong>
            </nav>

            <section className="topik-dataset-detail-card">
              <header className="topik-dataset-detail-card__header">
                <h1>{getDatasetTitle(selectedDataset)}</h1>
                <div className="topik-dataset-detail-card__downloads">
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
                <div className="topik-dataset-detail-state">Memuat data tabel...</div>
              ) : previewError ? (
                <div className="topik-dataset-detail-state">{previewError}</div>
              ) : (
                <div className="topik-dataset-table-wrap">
                  <table className="topik-dataset-table">
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

            <section className="topik-chart-card">
              <header>
                <h2>Grafik</h2>
              </header>
              {chartData.length > 0 ? (
                <div className="topik-chart-card__canvas">
                  <Suspense fallback={<div className="topik-dataset-detail-state">Memuat grafik...</div>}>
                    <DatasetLineChart data={chartData} />
                  </Suspense>
                </div>
              ) : (
                <div className="topik-dataset-detail-state">Grafik belum tersedia karena kolom tahun tidak ditemukan.</div>
              )}
            </section>
          </div>
        </section>
      </main>
    )
  }

  // HALAMAN UTAMA TOPIK
  return (
    <main className="topik-page">

      <section className="topik-hero">

        <div className="container topik-hero__content">

          <div>

            <h1>Topik</h1>

            <p>

              <button
                type="button"
                className="topik-breadcrumb-link"
                onClick={() => {
                  window.location.href = "/"
                }}
              >
                Home
              </button>
              <span>/</span>

              <button
                type="button"
                className="topik-breadcrumb-link"
                onClick={() => {
                  if (window.location.search) {
                    window.history.replaceState({}, "", "/topik")
                  }
                  setSelectedTopic(null)
                  setDatasets([])
                }}
              >
                <strong>Topik</strong>
              </button>

            </p>

          </div>

        </div>

      </section>

      <section className="topik-listing">

        <div className="container topik-listing__inner">

          {error ? (
            <div className="topik-state">
              {error}
            </div>
          ) : null}

          {!error && loading ? (
            <div className="topik-state">
              Memuat data topik dari CKAN...
            </div>
          ) : null}

          {!error && !loading ? (
            <div className="topik-grid">

              {topics.map((topic) => (
                <button
                  type="button"
                  className="topik-card"
                  key={topic.id}
                  onClick={() => openTopic(topic)}
                >

                  <div className="topik-card__thumb">
                    <img
                      src={topic.image}
                      alt={topic.title}
                    />
                  </div>

                  <div className="topik-card__headline">

                    <h2>{topic.title}</h2>

                    <span>
                      {topic.datasetCount} Dataset
                    </span>

                  </div>

                  <div className="topik-card__meta">

                    <span className="topik-card__meta-item">
                      <i aria-hidden="true">◌</i>
                      {topic.author}
                    </span>

                    <span
                      className="topik-card__divider"
                      aria-hidden="true"
                    />

                    <span className="topik-card__meta-item">
                      <i aria-hidden="true">◫</i>
                      {topic.publishedAt}
                    </span>

                  </div>

                </button>
              ))}

            </div>
          ) : null}

        </div>

        <button
          type="button"
          className="topik-scroll-top"
          aria-label="Kembali ke atas"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
        >
          ˄
        </button>

      </section>

    </main>
  )
}
