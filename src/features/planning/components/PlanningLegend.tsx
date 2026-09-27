import { useState, type CSSProperties } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import type { AbsenceTypeDTO } from '@/models'
import { hexToRgba } from '../lib/absenceCellStyle'
import type { PlanningDate } from '../lib/planningDates'

type PlanningLegendProps = {
  absenceTypes: AbsenceTypeDTO[]
  /** Jours affichés : la légende liste leurs jours fériés. */
  dates: PlanningDate[]
}

/** Couleur des échantillons de motifs (neutre). */
const SAMPLE = '#64748b'

const PATTERNS: { label: string; className: string; style: CSSProperties }[] = [
  {
    label: 'approuvée',
    className: 'h-3 w-5 rounded-[3px] border',
    style: { backgroundColor: hexToRgba(SAMPLE, 0.35), borderColor: SAMPLE },
  },
  {
    label: 'en attente',
    className: 'h-3 w-5 rounded-[3px] border border-dashed',
    style: {
      backgroundImage: `repeating-linear-gradient(135deg, ${hexToRgba(SAMPLE, 0.45)} 0 3px, ${hexToRgba(SAMPLE, 0.1)} 3px 6px)`,
      borderColor: SAMPLE,
    },
  },
  {
    label: 'demi-journée (haut : matin, bas : après-midi)',
    className: 'h-3 w-5 rounded-[3px] border',
    style: {
      background: `linear-gradient(to bottom, ${hexToRgba(SAMPLE, 0.35)} 50%, transparent 50%)`,
      borderColor: SAMPLE,
    },
  },
  {
    label: 'samedi décompté (veille de la reprise)',
    className: 'h-3 w-5 rounded-[3px] border border-dashed',
    style: { backgroundColor: hexToRgba(SAMPLE, 0.12), borderColor: SAMPLE },
  },
  {
    label: 'non décompté (dimanche, férié)',
    className: 'h-0.5 w-5 rounded-full',
    style: { backgroundColor: hexToRgba(SAMPLE, 0.55) },
  },
]

const TITLE_CLASS = 'font-semibold tracking-wide text-muted-foreground uppercase'

/**
 * Légende compacte sous la grille : types d'absence, motifs des barres, jours fériés de la
 * période. Toujours visible à partir de `md` (la grille défile au-dessus) ; repliée sur
 * téléphone, où la place manque.
 */
export function PlanningLegend({ absenceTypes, dates }: PlanningLegendProps) {
  const holidays = dates.filter((date) => date.isHoliday)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = useState(false)

  return (
    <Collapsible
      open={isDesktop || open}
      onOpenChange={setOpen}
      className="border-t bg-muted/50 text-xs text-muted-foreground"
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 px-3 py-2 font-semibold tracking-wide uppercase md:hidden">
        <span>
          Légende
          {holidays.length > 0 && (
            <span className="font-normal tracking-normal text-destructive normal-case">
              {' '}
              · {holidays.length} férié{holidays.length > 1 ? 's' : ''}
            </span>
          )}
        </span>
        <ChevronDown className="size-4 transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-1.5 px-3 pb-2 md:pt-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {absenceTypes.length > 0 && <span className={TITLE_CLASS}>Types</span>}
          {absenceTypes.map((type) => (
            <span key={type.uuid} className="flex items-center gap-1.5">
              <span
                className="size-3 shrink-0 rounded-[3px] border border-border"
                style={{ backgroundColor: type.color }}
              />
              {type.name}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={TITLE_CLASS}>Absence</span>
          {PATTERNS.map((pattern) => (
            <span key={pattern.label} className="flex items-center gap-1.5">
              <span className={cn('shrink-0', pattern.className)} style={pattern.style} />
              {pattern.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-5 shrink-0 rounded-[3px] border border-destructive/30 bg-hatch-holiday" />
            jour férié
          </span>
          {holidays.length > 0 && (
            <span className="text-destructive">
              {holidays.map((date) => `${date.label} : ${date.holidayName}`).join(' · ')}
            </span>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
