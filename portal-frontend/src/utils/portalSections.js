import { isTopicOrganization } from "./topics"

// Beberapa payload organisasi CKAN bisa membawa relasi group.
// Helper ini dipakai sebagai filter cepat saat field `groups` memang tersedia.
export function isPublikasiGroupOrganization(organization) {
  return (organization?.groups || []).some((group) => {
    const value = String(group?.name || group?.title || group?.display_name || "")
      .toLowerCase()
      .trim()

    return value === "publikasi"
  })
}

export function getPublicationOrganizationKeys(publications) {
  const keys = new Set()

  for (const dataset of publications) {
    [
      dataset.organization?.name,
      dataset.organization?.title,
      dataset.organization?.display_name,
      dataset.name,
      dataset.title,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase().trim())
      .forEach((value) => keys.add(value))
  }

  keys.add("publikasi")

  return keys
}

export function normalizePortalOrganizations(organizations, publications = []) {
  const excludedPublicationKeys = getPublicationOrganizationKeys(publications)

  return organizations
    .filter((organization) => !isPublikasiGroupOrganization(organization))
    .map((organization) => ({
      id: organization.id || organization.name || organization.title,
      title: organization.title || organization.display_name || organization.name || "Tanpa nama organisasi",
      name: organization.name || "-",
      packageCount: organization.package_count ?? 0,
      updatedAt: organization.metadata_modified || organization.created || null,
      imageUrl: organization.image_display_url || organization.image_url || "",
      raw: organization,
    }))
    .filter((organization) => organization.id)
    .filter((organization) => {
      const keys = [
        organization.name,
        organization.title,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase().trim())

      return !keys.some((key) => excludedPublicationKeys.has(key))
    })
    .filter((organization) => !isTopicOrganization(organization.raw))
    .sort((left, right) => left.title.localeCompare(right.title))
}
