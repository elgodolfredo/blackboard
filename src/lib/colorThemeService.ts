import type { ColorTheme } from './types'
import type { Theme } from './themeService'

export interface ColorConfig {
  light: { bg: string; text: string }
  dark: { bg: string; text: string }
}

export const colorThemes: Record<ColorTheme, ColorConfig> = {
  white: {
    light: { bg: '#ffffff', text: '#333333' },
    dark: { bg: '#404040', text: '#ffffff' },
  },
  red: {
    light: { bg: '#ffe0e0', text: '#333333' },
    dark: { bg: '#5c2a2a', text: '#ff9999' },
  },
  orange: {
    light: { bg: '#ffe8cc', text: '#333333' },
    dark: { bg: '#5c3d1a', text: '#ffb366' },
  },
  yellow: {
    light: { bg: '#fffacc', text: '#333333' },
    dark: { bg: '#5c5a1a', text: '#ffff99' },
  },
  green: {
    light: { bg: '#e0f0e0', text: '#333333' },
    dark: { bg: '#1a5c1a', text: '#99ff99' },
  },
  blue: {
    light: { bg: '#e0f0ff', text: '#333333' },
    dark: { bg: '#1a3d5c', text: '#99ccff' },
  },
  purple: {
    light: { bg: '#e8e0ff', text: '#333333' },
    dark: { bg: '#3d1a5c', text: '#cc99ff' },
  },
  pink: {
    light: { bg: '#ffe0f0', text: '#333333' },
    dark: { bg: '#5c1a3d', text: '#ff99cc' },
  },
}

export function getColorForTheme(colorTheme: ColorTheme | undefined, appTheme: Theme): ColorConfig[keyof ColorConfig] {
  // Default to 'white' if colorTheme is undefined (for migrating old data)
  const theme = colorTheme || 'white'
  const config = colorThemes[theme]
  return config[appTheme]
}

export function migrateOldColorFormat(group: any): ColorTheme {
  // If group already has colorTheme, return it
  if (group.colorTheme && group.colorTheme in colorThemes) {
    return group.colorTheme
  }

  // If group has old backgroundColor/textColor, migrate to closest theme
  if (group.backgroundColor && group.textColor) {
    const bgLower = group.backgroundColor.toLowerCase()
    
    // Simple mapping of old colors to new themes
    if (bgLower === '#ffffff') return 'white'
    if (bgLower === '#ffe0e0') return 'red'
    if (bgLower === '#ffe8cc') return 'orange'
    if (bgLower === '#fffacc') return 'yellow'
    if (bgLower === '#e0f0e0') return 'green'
    if (bgLower === '#e0f0ff') return 'blue'
    if (bgLower === '#e8e0ff') return 'purple'
    if (bgLower === '#ffe0f0') return 'pink'
  }

  // Default fallback
  return 'white'
}
