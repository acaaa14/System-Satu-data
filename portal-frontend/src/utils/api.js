const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8081"
  : window.location.origin

export default API_BASE_URL
