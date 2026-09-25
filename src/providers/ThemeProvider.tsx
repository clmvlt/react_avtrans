import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const STORAGE_KEY = 'theme-preference'
const DARK_QUERY = '(prefers-color-scheme: dark)'

function readStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

const getSystemPrefersDark = () => window.matchMedia(DARK_QUERY).matches

type ThemeProviderProps = {
  children: ReactNode
}

/**
 * Thème clair / sombre / système (guide dark mode Vite de shadcn), branché sur la même clé
 * localStorage que le Vue (`theme-preference`) et sur la classe `.dark` de <html>.
 * Le script anti-FOUC d'index.html applique la classe avant le premier rendu, sauf sur « / ».
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme)
  // La landing est toujours en clair : on part de l'URL pour ne pas faire clignoter le sombre
  // avant que la page n'active elle-même le clair forcé.
  const [forceLight, setForceLight] = useState(() => window.location.pathname === '/')
  const systemPrefersDark = useSyncExternalStore(subscribeToSystemTheme, getSystemPrefersDark)

  const preferredDark = theme === 'dark' || (theme === 'system' && systemPrefersDark)
  const isDark = preferredDark && !forceLight

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const setTheme = (next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }

  const value = {
    theme,
    isDark,
    setTheme,
    toggleTheme: () => setTheme(preferredDark ? 'light' : 'dark'),
    setForceLight,
  }

  return <ThemeContext value={value}>{children}</ThemeContext>
}
