import { useState } from 'react'
import { ChevronDown, CircleAlert, CircleCheck, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { FleetVehicleStatus } from '../../lib/fleetStatus'
import { FleetVehicleCard, type FleetSectionVariant } from './FleetVehicleCard'

const SECTION = {
  late: {
    title: 'En retard',
    icon: CircleAlert,
    iconClassName: 'bg-red-100 text-red-600 dark:bg-red-950/50',
  },
  upcoming: {
    title: 'À venir',
    icon: Clock,
    iconClassName: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50',
  },
  ok: {
    title: 'À jour',
    icon: CircleCheck,
    iconClassName: 'bg-green-100 text-green-600 dark:bg-green-950/50',
  },
} satisfies Record<FleetSectionVariant, unknown>

type FleetStatusSectionProps = {
  variant: FleetSectionVariant
  items: FleetVehicleStatus[]
}

function SectionBadge({ variant, count }: { variant: FleetSectionVariant; count: number }) {
  if (variant === 'late') return <Badge variant="destructive">{count}</Badge>
  return (
    <Badge
      variant="outline"
      className={
        variant === 'upcoming'
          ? 'border-amber-500/50 text-amber-600 dark:text-amber-400'
          : 'border-green-500/50 text-green-600 dark:text-green-400'
      }
    >
      {count}
    </Badge>
  )
}

/**
 * Section du tableau de bord (« En retard », « À venir », « À jour ») : en-tête avec pastille et
 * compteur, puis grille de cartes (1, 2 puis 3 colonnes). « À jour » est repliée par défaut.
 */
export function FleetStatusSection({ variant, items }: FleetStatusSectionProps) {
  const [open, setOpen] = useState(false)
  const { title, icon: Icon, iconClassName } = SECTION[variant]

  if (items.length === 0) return null

  const header = (
    <>
      <span className={cn('flex size-8 items-center justify-center rounded-full', iconClassName)}>
        <Icon className="size-4" />
      </span>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <SectionBadge variant={variant} count={items.length} />
    </>
  )

  const grid = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <FleetVehicleCard key={item.id} item={item} variant={variant} />
      ))}
    </div>
  )

  if (variant !== 'ok') {
    return (
      <div>
        <div className="mb-4 flex items-center gap-3">{header}</div>
        {grid}
      </div>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="mb-4 flex w-full cursor-pointer items-center gap-3 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        {header}
        <ChevronDown
          className={cn('size-5 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>{grid}</CollapsibleContent>
    </Collapsible>
  )
}
