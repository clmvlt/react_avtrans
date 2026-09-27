import type { ReactNode } from 'react'
import {
  CircleCheck,
  CircleX,
  Clock,
  LoaderCircle,
  ShieldUser,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type VerifyEmailStatusProps =
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
  /** Réponse `success: false` sans exception : carte vide, comme le Vue */
  | { status: 'empty' }

type StatusHeaderProps = {
  icon: LucideIcon
  /** Couleurs de la pastille de l'icône */
  iconClassName: string
  spin?: boolean
  title: string
  children: ReactNode
}

/** Pastille d'icône, titre et message d'un état de la vérification. */
function StatusHeader({ icon: Icon, iconClassName, spin, title, children }: StatusHeaderProps) {
  return (
    <>
      <div
        className={cn(
          'mb-4 inline-flex size-16 items-center justify-center rounded-full',
          iconClassName,
        )}
      >
        <Icon className={cn('size-8', spin && 'animate-spin')} />
      </div>
      <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {children}
    </>
  )
}

/** Contenu de la carte de /verify selon l'état de la vérification. */
export function VerifyEmailStatus(props: VerifyEmailStatusProps) {
  if (props.status === 'loading') {
    return (
      <div className="text-center">
        <StatusHeader
          icon={LoaderCircle}
          iconClassName="bg-info/10 text-info"
          spin
          title="Vérification en cours..."
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            Veuillez patienter pendant que nous vérifions votre email.
          </p>
        </StatusHeader>
      </div>
    )
  }

  if (props.status === 'success') {
    return (
      <div className="text-center">
        <StatusHeader
          icon={CircleCheck}
          iconClassName="bg-success/10 text-success"
          title="Email vérifié avec succès !"
        >
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{props.message}</p>
        </StatusHeader>

        <div className="mb-5 flex gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-left">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
            <ShieldUser className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1 text-sm font-semibold text-warning">
              Activation du compte requise
            </h3>
            <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
              Votre adresse email a été vérifiée, mais un{' '}
              <strong className="font-semibold text-warning">
                administrateur doit activer votre compte
              </strong>{' '}
              avant que vous puissiez vous connecter.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Vous recevrez une notification par email dès que votre compte sera activé.
            </p>
          </div>
        </div>

        <p className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          Redirection automatique dans quelques secondes...
        </p>
        <Button className="w-full" asChild>
          <Link to="/login">Retour à la connexion</Link>
        </Button>
      </div>
    )
  }

  if (props.status === 'error') {
    return (
      <div className="text-center">
        <StatusHeader
          icon={CircleX}
          iconClassName="bg-destructive/10 text-destructive"
          title="Erreur de vérification"
        >
          <p className="mb-6 text-sm leading-relaxed text-destructive">{props.message}</p>
        </StatusHeader>
        <div className="flex flex-col gap-3">
          <Button className="w-full" asChild>
            <Link to="/register">Retour à l'inscription</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    )
  }

  return null
}
