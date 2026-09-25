import { use } from 'react'
import { ThemeContext } from '@/providers/theme-context'

export function useTheme() {
  const context = use(ThemeContext)
  if (!context) throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  return context
}
