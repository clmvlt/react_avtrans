import { useEffect, useRef, useState } from 'react'

type FitToViewportOptions = {
  /** Marge laissée sous l'élément (px). */
  bottomOffset?: number
  /** Hauteur minimale (px), même sur un petit écran. */
  minHeight?: number
}

/**
 * Hauteur maximale pour qu'un élément tienne dans la fenêtre à partir de sa position dans la
 * page (une grille qui défile à l'intérieur plutôt que la page entière). Recalculée au
 * redimensionnement de la fenêtre et quand la mise en page au-dessus change.
 */
export function useFitToViewport<T extends HTMLElement>({
  bottomOffset = 24,
  minHeight = 320,
}: FitToViewportOptions = {}) {
  const ref = useRef<T>(null)
  const [maxHeight, setMaxHeight] = useState<number>()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const update = () => {
      // Position dans le document : indépendante du défilement courant
      const top = element.getBoundingClientRect().top + window.scrollY
      setMaxHeight(Math.max(minHeight, Math.floor(window.innerHeight - top - bottomOffset)))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(document.body)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [bottomOffset, minHeight])

  return { ref, maxHeight }
}
