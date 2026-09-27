import { ArrowLeft, House, LogIn } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { Button } from '@/components/ui/button'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import { selectIsAuthenticated, selectRoleUuid, useAuthStore } from '@/stores/auth-store'

/**
 * Bug B-13 du Vue reproduit (MIGRATION.md 8.2) pour « Page précédente » seulement : sans
 * historique, un utilisateur connecté est renvoyé en dur vers /vehicules, quel que soit le rôle.
 * « Retour à l'accueil » suit la route par défaut du rôle (demande de la refonte).
 */
const DASHBOARD_PATH = '/vehicules'

/** Page 404 publique (hors coquille) : code, message et boutons de sortie. */
export default function NotFoundPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const roleUuid = useAuthStore(selectRoleUuid)
  const homePath = isAuthenticated ? getDefaultRoute(roleUuid) : '/'

  const handleGoBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate(isAuthenticated ? DASHBOARD_PATH : '/login')
  }

  return (
    <>
      {/* Une SPA renvoie HTTP 200 sur les URL inconnues : le noindex évite les « soft 404 » */}
      <PageMeta title="Page non trouvée — AVTRANS Concept" robots="noindex, nofollow" />

      <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-8 sm:p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
          <p className="text-6xl leading-none font-bold tracking-tight text-primary">404</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            Page non trouvée
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez l'adresse, ou
            revenez à l'accueil.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Button asChild>
              <Link to={homePath}>
                <House className="size-4" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="size-4" />
              Page précédente
            </Button>
            {!isAuthenticated && (
              <Button variant="outline" asChild>
                <Link to="/login">
                  <LogIn className="size-4" />
                  Se connecter
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
