import type { ComponentProps, KeyboardEvent, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type DossierNavItemProps = Omit<ComponentProps<'div'>, 'onSelect'> & {
  icon: LucideIcon
  /** Couleur de l'icône quand l'élément n'est pas en surbrillance. */
  iconClassName: string
  label: string
  count: number
  selected: boolean
  /** Survolé pendant un glisser-déposer. */
  dragOver?: boolean
  onSelect: () => void
  /** Actions du dossier (boutons au survol en desktop, menu ⋮ en mobile). */
  actions?: ReactNode
  /** Le compteur s'efface au survol en desktop pour laisser la place aux actions. */
  hideCountOnHover?: boolean
}

/**
 * Entrée de la barre des dossiers de TypesEntretien.vue (« Tous », un dossier, « Non classés »).
 * Sélectionnable au clavier (Entrée / Espace) ; les actions apparaissent aussi au focus.
 */
export function DossierNavItem({
  icon: Icon,
  iconClassName,
  label,
  count,
  selected,
  dragOver = false,
  onSelect,
  actions,
  hideCountOnHover = false,
  className,
  ...props
}: DossierNavItemProps) {
  const highlighted = selected || dragOver

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
        'group relative flex cursor-pointer items-center gap-3 rounded-md px-3 py-3 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        selected
          ? 'bg-primary text-primary-foreground'
          : dragOver
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
