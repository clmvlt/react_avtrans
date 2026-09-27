import type { ComponentProps, ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

type PageHeaderProps = Omit<ComponentProps<'div'>, 'title'> & {
  title: ReactNode
  /** Une phrase qui dit à quoi sert la page */
  description?: ReactNode
  /** Boutons d'action de la page (action principale en dernier) */
  actions?: ReactNode
  /** Lien de retour vers la page parente, au-dessus du titre */
  back?: { to: string; label: string }
}

/**
 * En-tête d'une page : retour éventuel, titre et actions sur la même ligne (les actions passent
 * dessous si la place manque), description, puis `children` (onglets, compteurs…).
 *
 * @example
 * <PageHeader
 *   title="Mes absences"
 *   description="Demandez un congé et suivez vos demandes."
 *   actions={<Button><Plus />Nouvelle demande</Button>}
 * />
 */
export function PageHeader({
  title,
  description,
  actions,
  back,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      <div className="space-y-1">
        {back && (
          <Link
            to={back.to}
            className="-ml-1 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ChevronLeft className="size-4" />
            {back.label}
          </Link>
        )}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <h1 className="min-w-0 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}
