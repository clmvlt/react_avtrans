import { useNavigate } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Destination des gardes pour un compte inactif ou des droits insuffisants.
 * Texte repris tel quel du Vue (décision Q-UNAUTHORIZED : parité).
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const userRole = useAuthStore((s) => s.user?.role?.nom || null)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <PageMeta title="Accès non autorisé — AVTRANS Concept" robots="noindex, nofollow" />

      <div className="flex min-h-screen items-center justify-center bg-muted p-4 sm:p-6">
        <div className="w-full max-w-[480px] rounded-xl border border-border bg-card p-6 text-center shadow-xl sm:p-10">
          <div className="mb-6">
            <span aria-hidden="true" className="inline-block text-[48px] sm:text-[64px]">
              🚫
            </span>
          </div>

          <h1 className="mb-4 text-2xl font-semibold text-destructive sm:text-3xl">Accès refusé</h1>

          <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette application.
          </p>

          {userRole && (
            <div className="mb-6 inline-flex flex-col items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-6 py-4">
              <span className="text-sm tracking-wider text-muted-foreground uppercase">
                Votre rôle actuel
              </span>
              <span className="text-lg font-semibold text-warning">{userRole}</span>
            </div>
          )}

          <div className="mb-8">
            <p className="mb-3 text-base leading-relaxed text-muted-foreground">
              Seuls les <strong className="font-medium text-foreground">Administrateurs</strong> et
              les <strong className="font-medium text-foreground">Mécaniciens</strong> peuvent
              accéder à ce site.
            </p>
            <p className="mb-3 text-base leading-relaxed text-muted-foreground">
              Si vous êtes un <strong className="font-medium text-foreground">Utilisateur</strong>,
              veuillez utiliser l'application mobile pour accéder à vos pointages.
            </p>
            <p className="mt-4 text-sm text-muted-foreground/70">
              Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur
              système.
            </p>
          </div>

          <Button onClick={handleLogout} className="w-full">
            Se déconnecter
          </Button>
        </div>
      </div>
    </>
  )
}
