import { useQuery } from '@tanstack/react-query'
import { generatePdfPreview, generatePdfPreviewFromUrl, hashContent } from '@/lib/pdfPreview'

type UsePdfPreviewOptions = {
  /** Contenu du PDF en base64 (avec ou sans préfixe `data:`). */
  base64?: string | null
  /** URL du PDF ; prioritaire sur `base64` quand les deux sont fournis (comme le Vue). */
  url?: string | null
  /** Largeur de rendu en pixels (200 par défaut). */
  width?: number
}

/**
 * Miniature de la première page d'un PDF, mise en cache par TanStack Query
 * (clé `['pdf-preview', 'url' | 'b64', url | hash du contenu, largeur]`, `staleTime: Infinity`).
 * `data` est une data-URL JPEG ; la requête est désactivée sans source.
 *
 * @example const { data: previewUrl, isPending, isError } = usePdfPreview({ base64: file.fileB64, width: 250 })
 */
export function usePdfPreview({ base64, url, width = 200 }: UsePdfPreviewOptions) {
  const sourceKey = url ? ['url', url] : base64 ? ['b64', hashContent(base64)] : null

  return useQuery({
    queryKey: ['pdf-preview', ...(sourceKey ?? ['none']), width],
    queryFn: () =>
      url ? generatePdfPreviewFromUrl(url, width) : generatePdfPreview(base64 ?? '', width),
    enabled: sourceKey !== null,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
  })
}
