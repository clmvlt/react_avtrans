import { useId, type ComponentProps, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type HubCardProps = Omit<ComponentProps<'section'>, 'title'> & {
  title: ReactNode
  description?: ReactNode
  icon?: LucideIcon
  /** Boutons à droite du titre */
  actions?: ReactNode
  bodyClassName?: string
}

/** Bloc de la fiche employé : carte avec titre (icône, description, actions) puis contenu. */
export function HubCard({
  title,
  description,
  icon: Icon,
  actions,
  bodyClassName,
  className,
  children,
  ...props
}: HubCardProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className={cn('flex min-w-0 flex-col rounded-xl border bg-card', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
          <div className="min-w-0">
            <h2 id={titleId} className="text-base leading-tight font-semibold text-foreground">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      <div className={cn('flex-1 px-4 pt-3 pb-4 sm:px-5 sm:pb-5', bodyClassName)}>{children}</div>
    </section>
  )
}
