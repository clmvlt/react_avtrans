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
      <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
        <CircleCheck className="size-8" />
      </div>
      <h2 className="mb-6 text-xl font-semibold tracking-tight text-foreground">
        Inscription réussie !
      </h2>

      <ol className="mb-6 flex flex-col gap-3 text-left">
        {steps.map(({ icon: Icon, title, description }, index) => (
          <li key={title} className="flex gap-3 rounded-xl border bg-muted/40 p-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div className="flex-1">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon className="size-4 text-muted-foreground" />
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mb-6 flex gap-3 rounded-xl border border-info/30 bg-info/10 p-4 text-left">
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
