// Modifié : fichier livré par le CLI shadcn avec la barre latérale, réécrit sur useMediaQuery
// (useSyncExternalStore) ; la version d'origine appelait setState dans un effet, refusé par le lint.
import { useMediaQuery } from './useMediaQuery'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
}
