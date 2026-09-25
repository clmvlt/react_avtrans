import { CircleCheck, CircleX, Clock, LoaderCircle, ShieldUser } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

type VerifyEmailStatusProps =
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
  /** Réponse `success: false` sans exception : carte vide, comme le Vue */
  | { status: 'empty' }

/** Contenu de la carte de /verify selon l'état de la vérification. */
export function VerifyEmailStatus(props: VerifyEmailStatusProps) {
  if (props.status === 'loading') {
    return (
      <div className="text-center">
        <div className="mb-5 inline-flex size-20 items-center justify-center rounded-full bg-linear-to-br from-info to-info/80 sm:size-[100px]">
          <LoaderCircle className="size-10 animate-spin text-white sm:size-12" />
        </div>
        <h1 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
          Vérification en cours...
        </h1>
        <p className="mb-6 text-base leading-relaxed text-muted-foreground">
          Veuillez patienter pendant que nous vérifions votre email.
        </p>
      </div>
    )
  }

  if (props.status === 'success') {
    return (
      <div className="text-center">
        <div className="mb-5 inline-flex size-20 items-center justify-center rounded-full bg-linear-to-br from-success to-success/80 sm:size-[100px]">
          <CircleCheck className="size-10 text-white sm:size-12" />
        </div>
        <h1 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
          Email vérifié avec succès !
        </h1>
        <p className="mb-6 text-base leading-relaxed text-muted-foreground">{props.message}</p>

        <div className="mb-5 flex gap-4 rounded-md border-2 border-warning/30 bg-warning/10 p-5 text-left">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-warning to-warning/80 text-xl text-white">
            <ShieldUser className="size-5" />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-base font-bold text-warning">Activation du compte requise</h3>
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
        <div className="mb-5 inline-flex size-20 items-center justify-center rounded-full bg-linear-to-br from-destructive to-destructive/80 sm:size-[100px]">
          <CircleX className="size-10 text-white sm:size-12" />
        </div>
        <h1 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
          Erreur de vérification
        </h1>
        <p className="mb-6 text-base leading-relaxed text-destructive">{props.message}</p>
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
