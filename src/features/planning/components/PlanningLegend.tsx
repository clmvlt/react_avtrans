import type { AbsenceTypeDTO } from '@/models'

type PlanningLegendProps = {
  absenceTypes: AbsenceTypeDTO[]
}

/** Légende des types d'absence (pastille de couleur + nom), sous la grille. */
export function PlanningLegend({ absenceTypes }: PlanningLegendProps) {
  if (absenceTypes.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-4 border-t bg-muted/50 px-6 py-4">
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Types d&apos;absence
      </span>
      <div className="flex flex-wrap gap-4">
        {absenceTypes.map((type) => (
          <div key={type.uuid} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="size-3.5 rounded-sm border border-border"
              style={{ backgroundColor: type.color }}
            />
            <span>{type.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
