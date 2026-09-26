import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type DayOffsetBadgeProps = {
  /** « 10 juin » */
  label: string
  /** « Le lendemain · mardi 10 juin 2026 » */
  tooltip: string
}

/** Pastille signalant qu'une heure tombe un autre jour que celui de la carte (service de nuit). */
export function DayOffsetBadge({ label, tooltip }: DayOffsetBadgeProps) {
  if (!label) return null

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="cursor-pointer rounded bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground capitalize"
        >
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent className="capitalize">{tooltip}</TooltipContent>
    </Tooltip>
  )
}
