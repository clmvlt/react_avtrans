import { ArrowLeft, House, LogIn } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { PageMeta } from '@/components/shared/PageMeta'
import { Button } from '@/components/ui/button'
import { selectIsAuthenticated, useAuthStore } from '@/stores/auth-store'

/**
 * Bug B-13 du Vue reproduit (MIGRATION.md 8.2) : « Tableau de bord » et le repli de « Retour »
 * pointent en dur vers /vehicules, quel que soit le rôle (un utilisateur finit sur /unauthorized).
 */
const DASHBOARD_PATH = '/vehicules'

const SUGGESTION_CLASS =
  "relative pl-6 text-base text-muted-foreground before:absolute before:left-3 before:font-bold before:text-primary before:content-['•']"

export default function NotFoundPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  const handleGoBack = () => {
    if (window.history.length > 1) navigate(-1)
    else navigate(isAuthenticated ? DASHBOARD_PATH : '/login')
  }

  return (
    <>
      {/* Une SPA renvoie HTTP 200 sur les URL inconnues : le noindex évite les « soft 404 » */}
      <PageMeta title="Page non trouvée — AVTRANS Concept" robots="noindex, nofollow" />

      <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
        <div className="w-full max-w-[600px] text-center">
          <div className="mb-8 flex flex-col items-center gap-6">
            <h1 className="text-[80px] leading-none font-extrabold text-primary sm:text-[120px]">
              404
            </h1>
            <div>
              <h2 className="mb-3 text-2xl font-bold text-foreground sm:text-3xl">
                Page non trouvée
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                La page que vous recherchez n'existe pas ou a été déplacée.
              </p>
            </div>
          </div>

          <div className="mb-8 rounded-md border border-border bg-muted p-4 text-left sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Suggestions :</h3>
            <ul className="flex flex-col gap-2">
              <li className={SUGGESTION_CLASS}>Vérifiez l'URL dans la barre d'adresse</li>
              <li className={SUGGESTION_CLASS}>Retournez à la page précédente</li>
              <li className={SUGGESTION_CLASS}>
                {isAuthenticated ? 'Accédez au tableau de bord' : 'Connectez-vous à votre compte'}
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-sm:w-full max-sm:flex-col">
            <Button onClick={handleGoBack}>
              <ArrowLeft className="size-4" />
              Retour
            </Button>

            {isAuthenticated ? (
              <Button variant="secondary" asChild>
                <Link to={DASHBOARD_PATH}>
                  <House className="size-4" />
                  Tableau de bord
                </Link>
              </Button>
            ) : (
              <Button variant="secondary" asChild>
                <Link to="/login">
                  <LogIn className="size-4" />
                  Se connecter
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
