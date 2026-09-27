import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type PlatformCardProps = {
  /** Logo de la plateforme, dans sa pastille */
  icon: ReactNode
  /** Couleurs de la pastille du logo */
  iconClassName: string
  /** Dégradé de l'en-tête */
  headerClassName: string
  title: string
  subtitle: string
  /** Remarque du pied de carte */
  note: string
  className?: string
  children: ReactNode
}

/** Carte d'une plateforme de la page /download : en-tête avec logo, contenu, remarque en pied. */
export function PlatformCard({
  icon,
  iconClassName,
  headerClassName,
  title,
  subtitle,
  note,
  className,
  children,
}: PlatformCardProps) {
  return (
    <section
      className={cn('flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs', className)}
    >
      <div className={cn('flex items-center gap-4 border-b p-5', headerClassName)}>
        <div
          className={cn(
            'inline-flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm',
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">{children}</div>

      <div className="mt-auto border-t bg-muted/30 px-5 py-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          {note}
        </p>
      </div>
    </section>
  )
}
