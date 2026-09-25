import type { ComponentProps } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormErrorAlertProps = ComponentProps<'div'> & {
  message: string
}

/**
 * Bandeau d'erreur en tête des formulaires des dialogs absences / acomptes (erreur de chargement
 * des listes ou d'enregistrement). Le Vue affichait l'erreur d'enregistrement ici **et** en toast :
 * conservé. Réutilisé par la feature acomptes.
 */
export function FormErrorAlert({ message, className, ...props }: FormErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive',
        className,
      )}
      {...props}
    >
      <CircleAlert className="size-4 shrink-0" />
      {message}
    </div>
  )
}
