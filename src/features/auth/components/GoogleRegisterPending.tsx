import { Info, ShieldUser } from 'lucide-react'
import { Button } from '@/components/ui/button'

type GoogleRegisterPendingProps = {
  message: string
  /** « Aller à la connexion » */
  onGoToLogin: () => void
}

/** Écran « Compte créé ! » : compte Google créé, en attente d'activation par un administrateur. */
export function GoogleRegisterPending({ message, onGoToLogin }: GoogleRegisterPendingProps) {
  return (
    <div className="text-center">
      <div className="mb-5 inline-flex size-[88px] items-center justify-center rounded-full bg-linear-to-br from-info to-info/80">
        <ShieldUser className="size-11 text-white" />
      </div>
      <h2 className="mb-4 text-2xl font-bold text-foreground">Compte créé !</h2>

      <div className="mb-6 flex gap-3 rounded-md border border-info/30 bg-info/10 p-4 text-left">
        <Info className="mt-0.5 size-5 shrink-0 text-info" />
        <p className="text-sm leading-relaxed text-foreground">{message}</p>
      </div>

      <Button className="w-full" onClick={onGoToLogin}>
        Aller à la connexion
      </Button>
    </div>
  )
}
