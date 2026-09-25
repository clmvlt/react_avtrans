import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

type ExportStatusMessageProps = {
  variant: 'success' | 'error'
  children: ReactNode
}

/** Bandeau de résultat de l'export, en tête de la carte (succès vert, erreur rouge). */
export function ExportStatusMessage({ variant, children }: ExportStatusMessageProps) {
  const Icon = variant === 'success' ? CircleCheck : CircleAlert

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'mb-4 flex items-center gap-3 rounded-lg border p-4 font-medium',
        variant === 'success'
          ? 'border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400'
          : 'border-destructive bg-destructive/10 text-destructive',
      )}
    >
      <Icon className="size-5 shrink-0" />
      {children}
    </div>
  )
}
