import { CircleAlert, House, RefreshCw } from 'lucide-react'
import { useRouteError } from 'react-router'
import { Button } from '@/components/ui/button'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { selectIsAuthenticated, selectRoleUuid, useAuthStore } from '@/stores/auth-store'

/**
 * Erreur non rattrapée pendant le rendu ou le chargement d'une route (ex. fichier JS périmé
 * après un redéploiement). Rendu à la racine, hors coquille : d'où le `<main>`.
 * Les deux boutons rechargent complètement l'application (lien natif, pas de navigation du
 * router) pour récupérer les fichiers à jour.
 */
export function RouteErrorBoundary() {
  const error = useRouteError()
  console.error(error)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const roleUuid = useAuthStore(selectRoleUuid)
  const homePath = isAuthenticated ? getDefaultRoute(roleUuid) : '/'

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-8 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <CircleAlert className="size-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Une erreur est survenue
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          La page n'a pas pu s'afficher. Rechargez la page ou revenez à l'accueil pour réessayer.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild>
            <a href={homePath}>
              <House className="size-4" />
              Retour à l'accueil
            </a>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" />
            Recharger la page
          </Button>
        </div>
      </div>
    </main>
  )
}
