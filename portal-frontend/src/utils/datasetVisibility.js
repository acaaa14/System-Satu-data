const STORAGE_KEY = "portal-admin-dataset-settings"

export function readDatasetSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function writeDatasetSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function getDatasetKey(dataset) {
  return dataset.id || dataset.name
}

export function getDatasetSetting(dataset, settings = readDatasetSettings()) {
  return settings[getDatasetKey(dataset)] || {}
}

export function mergeDatasetsWithSettings(datasets, settings = readDatasetSettings()) {
  return datasets.map((dataset) => {
    const adminSetting = getDatasetSetting(dataset, settings)

    return {
      ...dataset,
      adminVisible: adminSetting.visible ?? true,
      adminFeatured: adminSetting.featured ?? false,
      adminNote: adminSetting.note ?? "",
      adminUpdatedAt: adminSetting.updatedAt ?? null,
    }
  })
}
