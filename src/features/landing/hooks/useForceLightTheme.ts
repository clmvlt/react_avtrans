import { useLayoutEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'

/**
 * La landing est toujours en thème clair (son HTML pré-rendu aussi) : force le clair pendant
 * que la page est montée, puis rend la main à la préférence enregistrée en la quittant
 * (équivalent du `wasDark` de Landing.vue). Effet de mise en page pour éviter qu'une arrivée
 * par navigation interne n'affiche une frame en sombre.
 */
export function useForceLightTheme() {
  const { setForceLight } = useTheme()

  useLayoutEffect(() => {
    setForceLight(true)
    return () => setForceLight(false)
  }, [setForceLight])
}
