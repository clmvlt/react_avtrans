import { CircleAlert, RefreshCw } from 'lucide-react'
import { useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'

/**
 * Erreur non rattrapée pendant le rendu ou le chargement d'une route (ex. fichier JS périmé
 * après un redéploiement). Propose de recharger l'application.
 */
export function RouteErrorBoundary() {
  const error = useRouteError()
  console.error(error)

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <CircleAlert className="size-12 text-destructive" />
        <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
        <p className="text-sm text-muted-foreground">
          La page n'a pas pu s'afficher. Rechargez l'application pour réessayer.
        </p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw /> Recharger
        </Button>
      </div>
    </main>
  )
}
