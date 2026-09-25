import type { ComponentProps } from 'react'
import { MapPinOff } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useMapboxMap, type UseMapboxMapOptions } from '@/hooks/useMapboxMap'
import { cn } from '@/lib/utils'

type MapboxMapProps = Omit<ComponentProps<'div'>, 'children'> & UseMapboxMapOptions

/**
 * Carte Mapbox avec marqueurs (remplace la carte de `useMapModal` du Vue, UserServices).
 * Hauteur par défaut 350 px, surchargeable par `className`. Utilisable tel quel dans un Dialog :
 * la carte se redimensionne à l'ouverture et est détruite à la fermeture (démontage).
 *
 * @example
 * import { MAP_MARKER_COLORS } from '@/hooks/useMapboxMap'
 * <MapboxMap
 *   markers={[
 *     { lng, lat, color: MAP_MARKER_COLORS.start, popupTitle: 'Début service', popupText: '08:02' },
 *     { lng: lng2, lat: lat2, color: MAP_MARKER_COLORS.end, popupTitle: 'Fin service', popupText: '17:30' },
 *   ]}
 * />
 */
export function MapboxMap({
  markers,
  mapStyle,
  zoom,
  fitPadding,
  fitMaxZoom,
  className,
  ...props
}: MapboxMapProps) {
  const { containerRef, status } = useMapboxMap({ markers, mapStyle, zoom, fitPadding, fitMaxZoom })

  return (
    <div className={cn('relative h-[350px] w-full', className)} {...props}>
      <div ref={containerRef} className="size-full" />
      {status === 'loading' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-muted/50">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted text-sm text-muted-foreground">
          <MapPinOff className="size-6" />
          Carte indisponible
        </div>
      )}
    </div>
  )
}
