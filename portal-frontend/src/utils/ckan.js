import axios from "axios"

// Saat development kita arahkan ke backend lokal, sedangkan production mengikuti origin website.
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8081"
  : window.location.origin

// Satu instance axios dipakai ulang agar semua request CKAN/proxy konsisten.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
})

// Backend CI4 membungkus payload CKAN di dalam `data.result`.
function getResultPayload(response) {
  return response?.data?.result ?? null
}

// Mengambil daftar dataset, atau hasil pencarian dataset jika ada keyword.
export async function fetchDatasets(search = "") {
  const endpoint = search.trim() ? "/api/search" : "/api/datasets"
  const response = await api.get(endpoint, {
    params: search.trim() ? { q: search.trim() } : undefined,
  })

  const result = getResultPayload(response)
  return result?.results || []
}

// Mengambil seluruh organisasi dari CKAN, termasuk yang belum punya dataset.
export async function fetchOrganizations() {
  const response = await api.get("/api/organizations")
  return getResultPayload(response) || []
}

// Mengambil detail satu dataset berdasarkan id atau slug.
export async function fetchDatasetById(id) {
  const response = await api.get(`/api/dataset/${id}`)
  return getResultPayload(response)
}

// Mengambil preview isi resource untuk kebutuhan tabel/preview data.
export async function fetchResourcePreview(resourceId) {
  const response = await api.get(`/api/preview/${resourceId}`)
  return getResultPayload(response)?.records || []
}

export { DEFAULT_API_BASE_URL }
