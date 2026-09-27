import { ArrowLeft, Clock, Info } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { BrowserInstructionsTabs } from '@/features/auth/components/BrowserInstructionsTabs'

/** Page protégée (sous AppLayout) : pas de métadonnées propres, comme le Vue. */
export default function AddToHomescreenPage() {
  const navigate = useNavigate()

  return (
    <PageContainer size="sm">
      <PageHeader
        title="Installer l'application"
        description="Ajoutez AVTRANS à l'écran d'accueil de votre téléphone."
      />

      <section className="rounded-xl border bg-card p-4 sm:p-6">
        <BrowserInstructionsTabs />

        <div className="mb-6 flex gap-3 rounded-lg border border-info/30 bg-info/10 p-4">
          <Info className="mt-0.5 size-5 shrink-0 text-info" />
          <p className="text-sm text-muted-foreground">
            Une fois le raccourci ajouté, vous pourrez accéder directement à l'application. Si votre
            session expire, vous serez redirigé vers la page de connexion.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4" />
            Retour
          </Button>
          <Button asChild>
            <Link to="/pointage">
              <Clock className="size-4" />
              Aller au Pointage
            </Link>
          </Button>
        </div>
      </section>
    </PageContainer>
  )
}
