import type { ReactNode } from 'react'
import {
  CircleCheck,
  Info,
  Mail,
  MousePointerClick,
  ShieldUser,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

type RegisterSuccessProps = {
  /** Adresse saisie à l'inscription */
  email: string
}

type Step = {
  icon: LucideIcon
  title: string
  description: ReactNode
}

/** Écran « Inscription réussie ! » : trois étapes, sans redirection automatique. */
export function RegisterSuccess({ email }: RegisterSuccessProps) {
  const steps: Step[] = [
    {
      icon: Mail,
      title: 'Vérifiez votre email',
      description: (
        <>
          Un email de vérification a été envoyé à{' '}
          <strong className="font-semibold text-primary">{email}</strong>
        </>
      ),
    },
    {
      icon: MousePointerClick,
      title: 'Activez votre compte',
      description: "Cliquez sur le lien de vérification dans l'email pour confirmer votre adresse",
    },
    {
      icon: ShieldUser,
      title: "Attendez l'activation par l'administrateur",
      description:
        'Après vérification de votre email, un administrateur doit activer votre compte pour vous permettre de vous connecter',
    },
  ]

  return (
    <div className="text-center">
      <div className="mb-5 inline-flex size-[100px] items-center justify-center rounded-full bg-linear-to-br from-success to-success/80">
        <CircleCheck className="size-14 text-white" />
      </div>
      <h2 className="mb-6 text-2xl font-bold text-foreground">Inscription réussie !</h2>

      <div className="mb-6 flex flex-col gap-4 text-left">
        {steps.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className="flex gap-4 rounded-md border border-border bg-muted p-4 transition-colors hover:border-primary hover:shadow-sm"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground">
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="mb-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <Icon className="size-4" />
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-3 rounded-md border border-info/30 bg-info/10 p-4 text-left">
        <Info className="mt-0.5 size-5 shrink-0 text-info" />
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold text-info">Email non reçu ?</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Vérifiez votre dossier spam ou courrier indésirable
          </p>
        </div>
      </div>

      <Button variant="outline" className="w-full" asChild>
        <Link to="/login">Retour à la connexion</Link>
      </Button>
    </div>
  )
}
