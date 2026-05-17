import type { ColorTheme } from './types'
import type { Theme } from './themeService'

export interface ColorConfig {
  light: { bg: string; text: string; border: string }
  dark: { bg: string; text: string; border: string }
}

export const colorThemes: Record<ColorTheme, ColorConfig> = {
  white: {
    light: { bg: '#ffffff', text: '#333333', border: '#d9d9d9' },
    dark: { bg: '#434343', text: '#dcdcdc', border: '#8f8f8f' },
  },
  red: {
    light: { bg: '#ffe0e0', text: '#333333', border: '#e8b9b9' },
    dark: { bg: '#673737', text: '#e3b6b6', border: '#b28686' },
  },
  orange: {
    light: { bg: '#ffe8cc', text: '#333333', border: '#e9c9a5' },
    dark: { bg: '#724328', text: '#e0b08c', border: '#ac856b' },
  },
  yellow: {
    light: { bg: '#fffacc', text: '#333333', border: '#e9e2a8' },
    dark: { bg: '#66642c', text: '#dddd9b', border: '#aca666' },
  },
  green: {
    light: { bg: '#e0f0e0', text: '#333333', border: '#bcd6bc' },
    dark: { bg: '#2f6532', text: '#b2deae', border: '#81a17f' },
  },
  blue: {
    light: { bg: '#e0f0ff', text: '#333333', border: '#b9d1e6' },
    dark: { bg: '#31576d', text: '#b0cfe1', border: '#809eaf' },
  },
  purple: {
    light: { bg: '#e8e0ff', text: '#333333', border: '#cec1e9' },
    dark: { bg: '#553d6a', text: '#ccb5df', border: '#9a89ad' },
  },
  pink: {
    light: { bg: '#ffe0f0', text: '#333333', border: '#e8bfd5' },
    dark: { bg: '#684055', text: '#dfb6cb', border: '#a9879a' },
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
