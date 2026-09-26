import { MapPin } from 'lucide-react'
import { MapboxMap } from '@/components/shared/MapboxMap'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { POSITION_UNAVAILABLE, type ServiceLocationDetails } from '../lib/serviceLocation'

type ServiceLocationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: ServiceLocationDetails | null
}

type CoordsLineProps = {
  label: string
  coords: string
  /** Couleur de la pastille quand la position est connue */
  dotClass: string
}

function CoordsLine({ label, coords, dotClass }: CoordsLineProps) {
  if (!coords) return null
  const unavailable = coords === POSITION_UNAVAILABLE
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-block size-2.5 rounded-full',
          unavailable ? 'bg-destructive' : dotClass,
        )}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn('font-mono', unavailable ? 'text-destructive' : 'text-muted-foreground')}>
        {coords}
      </span>
    </div>
  )
}

/**
 * Carte des positions de début (vert) et de fin (violet) d'un pointage (useMapModal du Vue).
 * La carte est détruite à la fermeture, quelle que soit la façon de fermer (fuite du Vue corrigée).
 */
export function ServiceLocationDialog({
  open,
  onOpenChange,
  location,
}: ServiceLocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[600px]" aria-describedby={undefined}>
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Localisation
          </DialogTitle>
        </DialogHeader>

        {location && (
          <>
            <div className="flex flex-col gap-2 bg-muted/50 px-5 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">{location.time}</span>
              </div>
              <CoordsLine label="Début :" coords={location.startCoords} dotClass="bg-green-500" />
              <CoordsLine label="Fin :" coords={location.endCoords} dotClass="bg-purple-800" />
            </div>
            <MapboxMap markers={location.markers} />
          </>
        )}

        <div className="border-t px-5 py-4">
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Fermer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
