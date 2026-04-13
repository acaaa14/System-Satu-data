import axios from "axios"

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8081"
  : window.location.origin

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
})

function getResultPayload(response) {
  return response?.data?.result ?? null
}

export async function fetchDatasets(search = "") {
  const endpoint = search.trim() ? "/api/search" : "/api/datasets"
  const response = await api.get(endpoint, {
    params: search.trim() ? { q: search.trim() } : undefined,
  })

  const result = getResultPayload(response)
  return result?.results || []
}

export async function fetchDatasetById(id) {
  const response = await api.get(`/api/dataset/${id}`)
  return getResultPayload(response)
}

export async function fetchResourcePreview(resourceId) {
  const response = await api.get(`/api/preview/${resourceId}`)
  return getResultPayload(response)?.records || []
}

export { DEFAULT_API_BASE_URL }
