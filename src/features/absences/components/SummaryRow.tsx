import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SummaryRowProps = {
  label: ReactNode
  children: ReactNode
  /** Classes de la valeur (par défaut `text-sm font-medium text-foreground`). */
  valueClassName?: string
}

/**
 * Ligne « libellé … valeur » des résumés des dialogs de validation (absences, acomptes).
 * Réutilisée par la feature acomptes.
 */
export function SummaryRow({ label, children, valueClassName }: SummaryRowProps) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium text-foreground', valueClassName)}>{children}</span>
    </div>
  )
}
