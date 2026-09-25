import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatSignatureBase64, formatSignatureDateTime } from '../lib/signatureFormatters'
import type { SignatureUserEntry } from '../lib/signatureResponses'

type SignatureViewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Utilisateur et sa dernière signature (conservés pendant l'animation de fermeture). */
  entry: SignatureUserEntry | null
}

/** Dernière signature d'un utilisateur : date, heures signées et image. */
export function SignatureViewDialog({ open, onOpenChange, entry }: SignatureViewDialogProps) {
  const signature = entry?.lastSignature

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Signature</DialogTitle>
          <DialogDescription>Détails de la signature</DialogDescription>
        </DialogHeader>
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold text-foreground">
            {entry?.user.firstName} {entry?.user.lastName}
          </p>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 rounded-md bg-muted p-3">
              <span className="text-xs tracking-wide text-muted-foreground uppercase">Date</span>
              <span className="text-base font-medium text-foreground">
                {formatSignatureDateTime(signature?.date)}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-md bg-muted p-3">
              <span className="text-xs tracking-wide text-muted-foreground uppercase">
                Heures signées
              </span>
              <span className="text-lg font-medium text-green-600 dark:text-green-400">
                {signature?.heuresSignees}h
              </span>
            </div>
          </div>
          <div className="rounded-md border bg-muted p-4">
            {signature?.signatureBase64 && (
              <img
                src={formatSignatureBase64(signature.signatureBase64)}
                alt="Signature"
                className="max-w-full rounded-sm"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
