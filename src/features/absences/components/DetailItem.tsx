import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DetailItemProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Libellé en petites majuscules au-dessus de la valeur. */
  label: ReactNode
  children: ReactNode
  /** Classes du libellé (les dialogs « mes » ont `font-medium tracking-wide`). */
  labelClassName?: string
}

/**
 * Paire libellé / valeur des dialogs de détail et de suppression (absences, acomptes).
 * Réutilisée par la feature acomptes.
 */
export function DetailItem({
  label,
  children,
  labelClassName,
  className,
  ...props
}: DetailItemProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)} {...props}>
      <span
        className={cn('text-xs tracking-wider text-muted-foreground uppercase', labelClassName)}
      >
        {label}
      </span>
      {children}
    </div>
  )
}
