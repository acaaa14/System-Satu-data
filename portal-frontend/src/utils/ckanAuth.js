const DEFAULT_CKAN_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : `${window.location.protocol}//${window.location.hostname}:5000`

export const CKAN_BASE_URL = import.meta.env.VITE_CKAN_BASE_URL || DEFAULT_CKAN_BASE_URL
const sanitizedBaseUrl = CKAN_BASE_URL.replace(/\/+$/, "")

export const CKAN_DASHBOARD_URL = `${sanitizedBaseUrl}/dashboard`
export const CKAN_LOGIN_URL = `${sanitizedBaseUrl}/user/login?came_from=${encodeURIComponent(CKAN_DASHBOARD_URL)}`
