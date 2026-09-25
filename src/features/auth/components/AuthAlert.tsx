import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type AuthAlertProps = {
  /** `error` : bandeau rouge sur une ligne ; `success` : bandeau vert avec titre */
  variant?: 'error' | 'success'
  /** Titre en gras (variante `success`) */
  title?: string
  /** Remplace l'icône par défaut de la variante */
  icon?: LucideIcon
  className?: string
  children: ReactNode
}

/** Bandeaux d'erreur et de succès des pages d'auth (mêmes styles que les blocs du Vue). */
export function AuthAlert({ variant = 'error', title, icon, className, children }: AuthAlertProps) {
  if (variant === 'success') {
    const Icon = icon ?? CircleCheck
    return (
      <div
        role="status"
        className={cn(
          'mb-6 flex items-start gap-3 rounded-md border border-success/30 bg-success/10 p-4 text-success',
          className,
        )}
      >
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div>
          {title && <p className="mb-1 text-base font-semibold">{title}</p>}
          {children}
        </div>
      </div>
    )
  }

  const Icon = icon ?? CircleAlert
  return (
    <div
      role="alert"
      className={cn(
        'mb-6 flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4.5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}
