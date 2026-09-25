import { useState, type WheelEvent } from 'react'

type UseZoomOptions = {
  /** Zoom minimal (0,5 par défaut). */
  min?: number
  /** Zoom maximal (5 par défaut). */
  max?: number
  /** Pas des boutons et de la molette (0,25 par défaut). */
  step?: number
}

/**
 * Niveau de zoom borné, piloté par des boutons et la molette (ImageLightbox).
 *
 * @example
 * const { zoom, zoomIn, zoomOut, resetZoom, onWheel } = useZoom()
 * <img style={{ transform: `scale(${zoom})` }} onWheel={onWheel} />
 */
export function useZoom({ min = 0.5, max = 5, step = 0.25 }: UseZoomOptions = {}) {
  const [zoom, setZoom] = useState(1)

  const zoomIn = () => setZoom((value) => Math.min(value + step, max))
  const zoomOut = () => setZoom((value) => Math.max(value - step, min))
  const resetZoom = () => setZoom(1)

  /** Molette vers le haut = zoom avant, vers le bas = zoom arrière. */
  const onWheel = (event: WheelEvent) => {
    if (event.deltaY < 0) zoomIn()
    else zoomOut()
  }

  return { zoom, zoomIn, zoomOut, resetZoom, onWheel }
}
