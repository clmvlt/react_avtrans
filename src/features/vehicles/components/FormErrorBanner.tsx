import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Bandeau d'erreur rouge des formulaires et dialogs véhicule (message de l'API ou du formulaire). */
export function FormErrorBanner({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive',
        className,
      )}
      {...props}
    />
  )
}
