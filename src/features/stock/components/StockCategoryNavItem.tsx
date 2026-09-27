import type { ComponentProps, KeyboardEvent, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type StockCategoryNavItemProps = Omit<ComponentProps<'div'>, 'children' | 'onSelect'> & {
  icon: LucideIcon
  /** Couleur de l'icône hors sélection (`text-primary`, `text-amber-500`…). */
  iconClassName: string
  label: string
  count: number
  /** Entrée sélectionnée (fond primary). */
  selected: boolean
  /** Survolée pendant un glisser-déposer (fond primary + ombre). */
  dropActive?: boolean
  /** Le compteur s'efface au survol en desktop pour laisser place aux actions. */
  hideCountOnHover?: boolean
  /** Actions de la catégorie (boutons au survol, menu ⋮ en mobile). */
  actions?: ReactNode
  onSelect: () => void
}

/** Entrée de la barre latérale du stock : « Tous », une catégorie ou « Non classés ». */
export function StockCategoryNavItem({
  icon: Icon,
  iconClassName,
  label,
  count,
  selected,
  dropActive = false,
  hideCountOnHover = false,
  actions,
  onSelect,
  className,
  ...props
}: StockCategoryNavItemProps) {
  const highlighted = selected || dropActive

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Ignore les touches venues des actions (boutons, menu) contenues dans l'entrée
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      className={cn(
        'group relative flex shrink-0 cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors md:py-3',
        selected
          ? 'bg-primary text-primary-foreground'
          : dropActive
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'hover:bg-accent',
        className,
      )}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <Icon
        className={cn('size-5 shrink-0', highlighted ? 'text-primary-foreground' : iconClassName)}
      />
      <span className="flex-1 truncate text-sm font-medium">{label}</span>
      <span
        className={cn(
          'min-w-6 shrink-0 rounded-full px-2 py-0.5 text-center text-xs',
          hideCountOnHover &&
            'transition-opacity md:group-focus-within:opacity-0 md:group-hover:opacity-0',
          highlighted ? 'bg-white/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
        )}
      >
        {count}
      </span>
      {actions}
    </div>
  )
}
