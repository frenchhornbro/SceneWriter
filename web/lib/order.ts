import { getLocalStorageItem, setLocalStorageItem } from "./cache"

export type SortField = "created" | "edited" | "scene_order"
export type SortDirection = "asc" | "desc"
export type ViewType = "scenes" | "plotpoints" | "characters"

export interface SortPreference {
  field: SortField
  direction: SortDirection
}

type ViewTypeKey = "scene" | "plot_point" | "character"

type StorySortPreferences = Partial<Record<ViewTypeKey, SortPreference>>

type AllSortPreferences = Record<string, StorySortPreferences>

const SORT_STORAGE_KEY = "scenewriter_sort"

function viewTypeToKey(viewType: ViewType): ViewTypeKey {
  switch (viewType) {
    case "scenes":
      return "scene"
    case "plotpoints":
      return "plot_point"
    case "characters":
      return "character"
  }
}

function getAllSortPreferences(): AllSortPreferences {
  const stored = getLocalStorageItem(SORT_STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as AllSortPreferences
    } catch {
      return {}
    }
  }
  return {}
}

function saveAllSortPreferences(prefs: AllSortPreferences): void {
  setLocalStorageItem(SORT_STORAGE_KEY, JSON.stringify(prefs))
}

export function getSortPreference(storyId: string, viewType: ViewType): SortPreference {
  const allPrefs = getAllSortPreferences()
  const storyPrefs = allPrefs[storyId]
  const key = viewTypeToKey(viewType)

  if (storyPrefs && storyPrefs[key]) {
    const pref = storyPrefs[key]
    if (isValidSortPreference(pref, viewType)) {
      return pref
    }
  }

  return getDefaultSortPreference(viewType)
}

export function setSortPreference(
  storyId: string,
  viewType: ViewType,
  preference: SortPreference
): void {
  const allPrefs = getAllSortPreferences()
  const key = viewTypeToKey(viewType)
  const defaultPref = getDefaultSortPreference(viewType)

  // Only store if different from default
  const isDefault = preference.field === defaultPref.field && preference.direction === defaultPref.direction

  if (!allPrefs[storyId]) {
    allPrefs[storyId] = {}
  }

  if (isDefault) {
    // Remove the entry if it matches default
    delete allPrefs[storyId][key]
    // Clean up empty story objects
    if (Object.keys(allPrefs[storyId]).length === 0) {
      delete allPrefs[storyId]
    }
  } else {
    allPrefs[storyId][key] = preference
  }

  saveAllSortPreferences(allPrefs)
}

export function setSortField(storyId: string, viewType: ViewType, field: SortField): void {
  const current = getSortPreference(storyId, viewType)
  setSortPreference(storyId, viewType, { ...current, field })
}

export function setSortDirection(storyId: string, viewType: ViewType, direction: SortDirection): void {
  const current = getSortPreference(storyId, viewType)
  setSortPreference(storyId, viewType, { ...current, direction })
}

export function toggleSortDirection(storyId: string, viewType: ViewType): SortDirection {
  const current = getSortPreference(storyId, viewType)
  const newDirection: SortDirection = current.direction === "asc" ? "desc" : "asc"
  setSortPreference(storyId, viewType, { ...current, direction: newDirection })
  return newDirection
}

function getDefaultSortPreference(viewType: ViewType): SortPreference {
  if (viewType === "scenes") {
    return { field: "scene_order", direction: "asc" }
  }
  return { field: "edited", direction: "desc" }
}

function isValidSortPreference(obj: unknown, viewType: ViewType): obj is SortPreference {
  if (typeof obj !== "object" || obj === null) return false

  const pref = obj as Record<string, unknown>

  const validDirections: SortDirection[] = ["asc", "desc"]
  if (!validDirections.includes(pref.direction as SortDirection)) return false

  const validFields: SortField[] = viewType === "scenes"
    ? ["created", "edited", "scene_order"]
    : ["created", "edited"]

  if (!validFields.includes(pref.field as SortField)) return false

  return true
}

export function getAvailableSortFields(viewType: ViewType): { value: SortField; label: string }[] {
  const baseFields: { value: SortField; label: string }[] = [
    { value: "created", label: "Created" },
    { value: "edited", label: "Last Edited" },
  ]

  if (viewType === "scenes") {
    return [
      { value: "scene_order", label: "Scene Order" },
      ...baseFields,
    ]
  }

  return baseFields
}
