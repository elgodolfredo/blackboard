export type Theme = 'light' | 'dark'

let currentTheme: Theme =
  (typeof localStorage !== 'undefined' && (localStorage.getItem('theme') as Theme)) || 'light'
let themeCallbacks: ((theme: Theme) => void)[] = []

export function subscribeToThemeChanges(callback: (theme: Theme) => void): () => void {
  themeCallbacks.push(callback)
  // Call immediately with current theme
  callback(currentTheme)

  return () => {
    themeCallbacks = themeCallbacks.filter((cb) => cb !== callback)
  }
}

export function getTheme(): Theme {
  return currentTheme
}

export function setTheme(theme: Theme): void {
  currentTheme = theme
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme)
  }
  // Update document class
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
  // Notify all subscribers
  themeCallbacks.forEach((callback) => callback(theme))
}

export function toggleTheme(): void {
  setTheme(currentTheme === 'light' ? 'dark' : 'light')
}

// Initialize theme on load
if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('data-theme', currentTheme)
}
