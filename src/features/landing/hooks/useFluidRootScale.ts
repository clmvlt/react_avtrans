import { useLayoutEffect } from 'react'

/** Classe de <html> qui agrandit la police racine au-delà de 1920 px (voir landing.css) */
const FLUID_SCALE_CLASS = 'landing-fluid'

/**
 * Mise à l'échelle grands écrans : la landing est entièrement dimensionnée en rem, la classe
 * `landing-fluid` fait grossir la police racine au-delà de 1920 px de large, donc toute la page
 * suit proportionnellement. Retirée en quittant la page.
 */
export function useFluidRootScale() {
  useLayoutEffect(() => {
    const html = document.documentElement
    html.classList.add(FLUID_SCALE_CLASS)
    return () => html.classList.remove(FLUID_SCALE_CLASS)
  }, [])
}
