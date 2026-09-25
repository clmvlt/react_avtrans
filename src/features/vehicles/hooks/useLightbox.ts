import { useState } from 'react'

type LightboxState = {
  open: boolean
  images: string[]
  index: number
}

/**
 * État de l'`ImageLightbox` (galerie plein écran), repris d'`openImageFullscreen`
 * (VehiculeDetail.vue:1215) : une galerie si des images sont fournies, sinon l'image seule.
 */
export function useLightbox() {
  const [state, setState] = useState<LightboxState>({ open: false, images: [], index: 0 })

  const show = (url: string, images?: string[], index?: number) => {
    if (images && images.length > 0) {
      setState({ open: true, images, index: index ?? 0 })
    } else {
      setState({ open: true, images: [url], index: 0 })
    }
  }

  const onOpenChange = (open: boolean) => setState((current) => ({ ...current, open }))

  return { ...state, show, onOpenChange }
}
