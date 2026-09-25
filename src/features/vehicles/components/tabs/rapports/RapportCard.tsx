import { CalendarDays, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RapportVehiculeDTO } from '@/models'
import { formatDateTime } from '../../../lib/formatters'
import { UserChip } from '../../UserChip'

type RapportCardProps = {
  rapport: RapportVehiculeDTO
  onViewPictures: (rapport: RapportVehiculeDTO) => void
}

/**
 * Rapport d'un véhicule : date à gauche, auteur à droite (l'inverse des commentaires), texte,
 * puis « Voir les photos (n) » s'il y en a. Retours à la ligne non rendus, comme le Vue.
 */
export function RapportCard({ rapport, onViewPictures }: RapportCardProps) {
  const picturesCount = rapport.pictures?.length ?? 0

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          {formatDateTime(rapport.createdAt)}
        </div>
        {rapport.user && <UserChip user={rapport.user} />}
      </div>

      <p className="text-sm text-foreground">{rapport.commentaire}</p>

      {picturesCount > 0 && (
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => onViewPictures(rapport)}>
            <Images className="mr-2 size-4" />
            Voir les photos ({picturesCount})
          </Button>
        </div>
      )}
    </div>
  )
}
