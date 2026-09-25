import { useEffect, useRef, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const DESKTOP_MIN_WIDTH = 1024

/** Variable CSS (en px) posée sur l'élément référencé, lue par les calques du héro */
const PARALLAX_VAR = '--parallax-y'

/**
 * Parallaxe du héro (desktop uniquement, sans animations réduites). Le défilement, limité par
 * requestAnimationFrame et plafonné à la hauteur de la fenêtre, est écrit dans la variable CSS
 * `--parallax-y` de l'élément référencé : aucun setState à chaque frame.
 * Comme Landing.vue, l'activation est évaluée une seule fois, au montage (pas de réaction au
 * redimensionnement), et la variable n'est posée qu'au premier défilement.
 */
export function useParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [enabled] = useState(
    () =>
      !window.matchMedia(REDUCED_MOTION_QUERY).matches && window.innerWidth >= DESKTOP_MIN_WIDTH,
  )

  useEffect(() => {
    const element = ref.current
    if (!enabled || !element) return

    let rafId: number | null = null
    const onScroll = () => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(() => {
        element.style.setProperty(PARALLAX_VAR, `${Math.min(window.scrollY, window.innerHeight)}px`)
        rafId = null
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [enabled])

  return { ref, enabled }
}
