const STORAGE_KEY = "portal-admin-publications"

export function readPublications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writePublications(publications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(publications))
}

export function sortPublications(publications) {
  return [...publications].sort((left, right) => {
    if ((right.year || 0) !== (left.year || 0)) {
      return Number(right.year || 0) - Number(left.year || 0)
    }

    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
  })
}
