import { ArrowLeft, Clock, Info, Smartphone } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { BrowserInstructionsTabs } from '@/features/auth/components/BrowserInstructionsTabs'

/** Page protégée (sous AppLayout) : pas de métadonnées propres, comme le Vue. */
export default function AddToHomescreenPage() {
  const navigate = useNavigate()

  return (
    <AuthCard className="max-w-[540px]">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary sm:size-20">
          <Smartphone className="size-7 text-primary-foreground sm:size-9" />
        </div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Ajouter à l'écran d'accueil
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Accédez rapidement à l'application depuis votre écran d'accueil
        </p>
      </div>

      <BrowserInstructionsTabs />

      <div className="mb-6 flex gap-3 rounded-md border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950">
        <Info className="mt-0.5 size-5 shrink-0 text-violet-500" />
        <p className="text-sm text-muted-foreground">
          Une fois le raccourci ajouté, vous pourrez accéder directement à l'application. Si votre
          session expire, vous serez redirigé vers la page de connexion.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button className="w-full" size="lg" asChild>
          <Link to="/pointage">
            <Clock className="size-4" />
            Aller au Pointage
          </Link>
        </Button>
        <Button variant="outline" className="w-full" size="lg" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4" />
          Retour
        </Button>
      </div>
    </AuthCard>
  )
}
