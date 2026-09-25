import { Badge } from '@/components/ui/badge'
import { getServiceModificationActionMeta } from '@/utils/serviceModificationFormatters'

type ServiceModificationActionBadgeProps = {
  action: string | null | undefined
}

/** Badge de l'action du journal : Ajout (vert), Modification (bleu), Suppression (rouge). */
export function ServiceModificationActionBadge({ action }: ServiceModificationActionBadgeProps) {
  const meta = getServiceModificationActionMeta(action)
  const Icon = meta.icon

  return (
    <Badge variant="outline" className={meta.classes}>
      <Icon />
      {meta.label}
    </Badge>
  )
}
