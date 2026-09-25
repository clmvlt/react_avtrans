import { Clock, FingerprintPattern, Smartphone, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type HomeScreenPromptDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** « Voir » */
  onNavigate: () => void
  /** « Plus tard » */
  onDismiss: () => void
}

const BENEFITS = [
  { icon: Zap, label: 'Connexion instantanée' },
  { icon: FingerprintPattern, label: 'Pas besoin de mot de passe' },
  { icon: Clock, label: 'Accès rapide au pointage' },
]

/**
 * Proposition d'ajouter un raccourci à l'écran d'accueil, après une connexion sur mobile.
 * Seuls « Voir » et « Plus tard » déclenchent une action : l'overlay, Échap ou la croix ferment
 * simplement le dialog (bug B-12 du Vue reproduit, MIGRATION.md 8.2).
 */
export function HomeScreenPromptDialog({
  open,
  onOpenChange,
  onNavigate,
  onDismiss,
}: HomeScreenPromptDialogProps) {
  const handleNavigate = () => {
    onOpenChange(false)
    onNavigate()
  }

  const handleDismiss = () => {
    onOpenChange(false)
    onDismiss()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Raccourci écran d'accueil</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-2 text-center">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-600 text-white">
            <Smartphone className="size-7" />
          </div>
          <DialogDescription className="text-base leading-relaxed text-foreground">
            Souhaitez-vous ajouter un raccourci sur votre écran d'accueil pour vous connecter en un
            seul clic ?
          </DialogDescription>
          <div className="flex w-full flex-col gap-3 text-left">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-md bg-secondary p-3">
                <Icon className="size-5 shrink-0 text-green-600" />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleDismiss}>
            Plus tard
          </Button>
          <Button onClick={handleNavigate}>Voir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
