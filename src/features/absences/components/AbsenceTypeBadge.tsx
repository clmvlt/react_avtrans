import type { CSSProperties } from 'react'
import { Badge } from '@/components/ui/badge'
import type { AbsenceDTO } from '@/models'

type AbsenceTypeBadgeProps = {
  absence: Pick<AbsenceDTO, 'absenceType' | 'customType'>
  /**
   * - `list` : badge des listes admin (type personnalisé en badge gris) ;
   * - `tag` : étiquette rectangulaire des dialogs admin de détail et de suppression ;
   * - `outline` : badge contour du détail employé.
   */
  appearance?: 'list' | 'tag' | 'outline'
}

/** Teinte du type : fond `couleur + 20` (≈ 12 %), texte et bordure de la couleur (`#RRGGBB`). */
const typeStyle = (color?: string): CSSProperties => ({
  backgroundColor: `${color}20`,
  color,
  borderColor: color,
})

/**
 * Type d'une absence, aux couleurs de son type ; type personnalisé en neutre. Ne rend rien sans
 * type (la cellule de table affiche alors « - » elle-même).
 */
export function AbsenceTypeBadge({ absence, appearance = 'list' }: AbsenceTypeBadgeProps) {
  const { absenceType, customType } = absence

  if (appearance === 'tag') {
    if (absenceType) {
      return (
        <span
          className="inline-block w-fit rounded-md border px-2.5 py-0.5 text-xs font-medium"
          style={typeStyle(absenceType.color)}
        >
          {absenceType.name}
        </span>
      )
    }
    if (customType) {
      return (
        <span className="inline-block w-fit rounded-md border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {customType}
        </span>
      )
    }
    return null
  }

  if (absenceType) {
    return (
      <Badge
        variant="outline"
        className={appearance === 'outline' ? 'w-fit' : undefined}
        style={typeStyle(absenceType.color)}
      >
        {absenceType.name}
      </Badge>
    )
  }
  if (customType) {
    return (
      <Badge
        variant={appearance === 'outline' ? 'outline' : 'secondary'}
        className={appearance === 'outline' ? 'w-fit' : undefined}
      >
        {customType}
      </Badge>
    )
  }
  return null
}
