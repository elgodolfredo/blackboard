import type { ColorTheme } from './types'
import type { Theme } from './themeService'

export interface ColorConfig {
  light: { bg: string; text: string }
  dark: { bg: string; text: string }
}

export const colorThemes: Record<ColorTheme, ColorConfig> = {
  white: {
    light: { bg: '#ffffff', text: '#333333' },
    dark: { bg: '#4a4a4a', text: '#e8e8e8' },
  },
  red: {
    light: { bg: '#ffe0e0', text: '#333333' },
    dark: { bg: '#7a3535', text: '#f4b8b8' },
  },
  orange: {
    light: { bg: '#ffe8cc', text: '#333333' },
    dark: { bg: '#b7410a', text: '#ffb366' },
  },
  yellow: {
    light: { bg: '#fffacc', text: '#333333' },
    dark: { bg: '#7a7828', text: '#f4f49e' },
  },
  green: {
    light: { bg: '#e0f0e0', text: '#333333' },
    dark: { bg: '#2a7a2a', text: '#a8f4a8' },
  },
  blue: {
    light: { bg: '#e0f0ff', text: '#333333' },
    dark: { bg: '#285a7a', text: '#a8d4f4' },
  },
  purple: {
    light: { bg: '#e8e0ff', text: '#333333' },
    dark: { bg: '#5a287a', text: '#d4a8f4' },
  },
  pink: {
    light: { bg: '#ffe0f0', text: '#333333' },
    dark: { bg: '#7a285a', text: '#f4a8d4' },
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
