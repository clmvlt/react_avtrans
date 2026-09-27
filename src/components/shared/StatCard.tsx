import type { ComponentProps, ComponentType, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const statCardVariants = cva('flex items-center border bg-card', {
  variants: {
    variant: {
      /** Heures, Contrats : icône 40 px masquée sous `sm` (deux cartes par ligne), valeur en `text-2xl`. */
      default: 'gap-3 rounded-xl p-3 sm:p-4',
      /** Pointage : compteur compact mobile, icône masquée sous `sm`, valeur en police mono. */
      compact: 'gap-2.5 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3',
    },
  },
  defaultVariants: { variant: 'default' },
})

type StatCardProps = ComponentProps<'div'> &
  VariantProps<typeof statCardVariants> & {
    icon: ComponentType<{ className?: string }>
    label: ReactNode
    value: ReactNode
    /** Couleurs de la pastille d'icône, ex. `'bg-violet-500/10 text-violet-500'`. */
    iconClassName?: string
  }

/**
 * Carte de statistique (icône dans une pastille colorée, libellé, valeur) : forme commune des
 * cartes de Heures.vue, ContractHours.vue (`default`) et des compteurs de Pointage.vue (`compact`).
 *
 * @example
 * <StatCard icon={CalendarDays} iconClassName="bg-violet-500/10 text-violet-500"
 *   label="Aujourd'hui" value={formatHours(totals.day)} />
 * <StatCard variant="compact" icon={CalendarRange}
 *   iconClassName="bg-amber-500/15 text-amber-600 dark:text-amber-400" label="Mois" value="42h" />
 */
export function StatCard({
  icon: Icon,
  label,
  value,
  iconClassName,
  variant,
  className,
  ...props
}: StatCardProps) {
  const compact = variant === 'compact'

  return (
    <div className={cn(statCardVariants({ variant }), className)} {...props}>
      <div
        className={cn(
          'shrink-0 items-center justify-center',
          compact ? 'hidden size-9 rounded-md sm:flex' : 'hidden size-10 rounded-lg sm:flex',
          iconClassName,
        )}
      >
        <Icon className={compact ? 'size-4' : 'size-5'} />
      </div>
      {compact ? (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <span className="truncate font-mono text-base font-bold text-foreground tabular-nums sm:text-lg">
            {value}
          </span>
        </div>
      ) : (
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
      )}
    </div>
  )
}
