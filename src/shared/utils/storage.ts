/**
 * Local storage utilities for saving and loading user data (F0611).
 */

const STORAGE_KEY_PREFIX = 'relary_dataset_'

export interface SavedDataset {
  name: string
  data: string
  timestamp: number
}

/**
 * Save user data to local storage with a given name.
 */
export function saveDataset(name: string, data: string): void {
  if (!name.trim()) {
    throw new Error('Dataset name cannot be empty')
  }
  
  const dataset: SavedDataset = {
    name: name.trim(),
    data,
    timestamp: Date.now()
  }
  
  const key = STORAGE_KEY_PREFIX + name.trim()
  localStorage.setItem(key, JSON.stringify(dataset))
}

/**
 * Load user data from local storage by name.
 */
export function loadDataset(name: string): string | null {
  const key = STORAGE_KEY_PREFIX + name.trim()
  const stored = localStorage.getItem(key)
  
  if (!stored) return null
  
  try {
    const dataset: SavedDataset = JSON.parse(stored)
    return dataset.data
  } catch {
    return null
  }
}

/**
 * Get all saved dataset names.
 */
export function listDatasets(): string[] {
  const datasets: { name: string; timestamp: number }[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const dataset: SavedDataset = JSON.parse(stored)
          datasets.push({ name: dataset.name, timestamp: dataset.timestamp })
        } catch {
          // Skip invalid entries
        }
      }
    }
  }
  
  // Sort by timestamp (most recent first)
  datasets.sort((a, b) => b.timestamp - a.timestamp)
  return datasets.map(d => d.name)
}

/**
 * Delete a saved dataset by name.
 */
export function deleteDataset(name: string): void {
  const key = STORAGE_KEY_PREFIX + name.trim()
  localStorage.removeItem(key)
}
