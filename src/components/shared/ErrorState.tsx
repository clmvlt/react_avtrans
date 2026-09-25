import type { ComponentProps } from 'react'
import { CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ErrorStateProps = Omit<ComponentProps<typeof Alert>, 'variant' | 'title'> & {
  /** Titre en gras (« Erreur de chargement » par défaut). */
  title?: string
  /** Message affiché ; à défaut, celui de `error`, puis un message générique. */
  message?: string
  /** Erreur de la requête (`query.error`) : son message est affiché si `message` est absent. */
  error?: unknown
  /** Affiche le bouton « Réessayer » (typiquement `() => void query.refetch()`). */
  onRetry?: () => void
  /** Nouvelle tentative en cours (`query.isRefetching`) : bouton désactivé avec spinner. */
  isRetrying?: boolean
}

/**
 * Erreur de **chargement** d'un écran ou d'un bloc : Alert destructive avec message et bouton
 * « Réessayer ». Une erreur d'action (mutation) passe par un toast, pas par ce composant.
 * Pour un état vide, utiliser `Empty` de `@/components/ui/empty`.
 *
 * @example
 * if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} isRetrying={query.isRefetching} />
 */
export function ErrorState({
  title = 'Erreur de chargement',
  message,
  error,
  onRetry,
  isRetrying = false,
  className,
  ...props
}: ErrorStateProps) {
  const text =
    message ||
    (error instanceof Error && error.message ? error.message : '') ||
    'Impossible de charger les données.'

  return (
    <Alert variant="destructive" className={cn(className)} {...props}>
      <CircleAlert />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{text}</p>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 text-foreground"
            disabled={isRetrying}
            onClick={onRetry}
          >
            {isRetrying ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Réessayer
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
