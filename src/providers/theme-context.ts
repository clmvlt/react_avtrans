import { createContext } from 'react'

export type Theme = 'light' | 'dark' | 'system'

export type ThemeContextValue = {
  /** Préférence enregistrée (clé localStorage `theme-preference`) */
  theme: Theme
  /** Thème réellement affiché (tient compte de la préférence système et du clair forcé) */
  isDark: boolean
  setTheme: (theme: Theme) => void
  /** Bascule clair ↔ sombre à partir du thème affiché (ignore « système ») */
  toggleTheme: () => void
  /** Force le thème clair tant qu'il vaut true (landing, dont le HTML pré-rendu est en clair) */
  setForceLight: (forceLight: boolean) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
