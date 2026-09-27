import { House, LogOut, ShieldX } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { Button } from '@/components/ui/button'
import { getDefaultRoute } from '@/lib/getDefaultRoute'
import {
  selectIsActive,
  selectIsAuthenticated,
  selectRoleUuid,
  useAuthStore,
} from '@/stores/auth-store'

/**
 * Destination des gardes pour un compte inactif ou des droits insuffisants.
 * Texte repris tel quel du Vue (décision Q-UNAUTHORIZED : parité).
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const userRole = useAuthStore((s) => s.user?.role?.nom || null)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isActive = useAuthStore(selectIsActive)
  const roleUuid = useAuthStore(selectRoleUuid)
  const logout = useAuthStore((s) => s.logout)

  // Compte inactif : la route par défaut ramènerait ici, seul « Se déconnecter » est proposé
  const canGoHome = !isAuthenticated || isActive
  const homePath = isAuthenticated ? getDefaultRoute(roleUuid) : '/'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <PageMeta title="Accès non autorisé — AVTRANS Concept" robots="noindex, nofollow" />

      <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-8 sm:p-6">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm sm:p-8">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="size-8" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Accès refusé</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette application.
          </p>

          {userRole && (
            <p className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm">
              <span className="text-muted-foreground">Votre rôle actuel :</span>
              <span className="font-semibold text-warning">{userRole}</span>
            </p>
          )}

          <div className="mt-6 space-y-3 text-left text-sm leading-relaxed text-muted-foreground">
            <p>
              Seuls les <strong className="font-medium text-foreground">Administrateurs</strong> et
              les <strong className="font-medium text-foreground">Mécaniciens</strong> peuvent
              accéder à ce site.
            </p>
            <p>
              Si vous êtes un <strong className="font-medium text-foreground">Utilisateur</strong>,
              veuillez utiliser l'application mobile pour accéder à vos pointages.
            </p>
            <p className="text-xs">
              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur
              système.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {canGoHome && (
              <Button asChild>
                <Link to={homePath}>
                  <House className="size-4" />
                  Retour à l'accueil
                </Link>
              </Button>
            )}
            <Button variant={canGoHome ? 'outline' : 'default'} onClick={handleLogout}>
              <LogOut className="size-4" />
              Se déconnecter
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}
