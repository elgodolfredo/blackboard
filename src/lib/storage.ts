import type { AppState } from './types'

const STORAGE_KEY = 'taskboard-state'

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return { groups: [] }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as AppState
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error)
  }

  return { groups: [] }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save state to localStorage:', error)
  }
}
