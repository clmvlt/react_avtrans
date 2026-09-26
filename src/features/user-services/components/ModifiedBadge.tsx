import { PencilLine } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ServiceDTO } from '@/models'
import { formatParisDateTime } from '@/utils/timeFormatters'

type ModifiedBadgeProps = {
  service: ServiceDTO
  onOpenHistory: () => void
}

/** Infobulle du badge « Modifié » : auteur et date de la dernière modification (heure de Paris). */
function getModifiedLabel(service: ServiceDTO): string {
  const author = service.modifiedByName || 'un administrateur supprimé'
  return `Modifié par ${author} le ${formatParisDateTime(service.modifiedAt)}`
}

/** Pointage modifié par un admin : infobulle, et clic vers l'historique des modifications. */
export function ModifiedBadge({ service, onOpenHistory }: ModifiedBadgeProps) {
  if (!service.modifiedAt) return null
  const label = getModifiedLabel(service)

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Badge
          asChild
          variant="outline"
          className="cursor-pointer border-sky-500/50 font-sans text-sky-600 transition-colors hover:bg-sky-500/10 dark:text-sky-400"
        >
          <button type="button" aria-label={`${label} — voir l'historique`} onClick={onOpenHistory}>
            <PencilLine />
            Modifié
          </button>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
