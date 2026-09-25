import { useRef, useState, type SyntheticEvent } from 'react'
import { Check, CircleAlert, Clock, FilePenLine, LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { SignaturePad, type SignaturePadHandle } from '@/components/shared/SignaturePad'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCreateSignatureMutation } from '../api/useCreateSignatureMutation'
import { useSignatureReminder } from '../hooks/useSignatureReminder'
import { formatHoursMinutes } from '../lib/signatureFormatters'

const preventClose = (event: SyntheticEvent | Event) => event.preventDefault()

/**
 * Rappel de signature des heures du mois dernier (SignatureReminderDialog.vue), autonome : il lit
 * lui-même le résumé de signature et n'affiche rien s'il n'y a rien à signer. À monter une fois
 * dans les dialogs globaux de l'app authentifiée.
 *
 * **Bloquant, exception assumée à la règle de fermeture par l'overlay (CLAUDE.md)** : pas de
 * croix, `open` contrôlé sans `onOpenChange`, Échap et clic extérieur ignorés. Il ne se ferme
 * qu'une fois la signature enregistrée.
 */
export function SignatureReminderDialog() {
  const { show, heuresLastMonth } = useSignatureReminder()

  return (
    <Dialog open={show}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        showCloseButton={false}
        onEscapeKeyDown={preventClose}
        onInteractOutside={preventClose}
      >
        <SignatureReminderBody heuresLastMonth={heuresLastMonth} />
      </DialogContent>
    </Dialog>
  )
}

type SignatureReminderBodyProps = {
  heuresLastMonth: number
}

/** Contenu monté à chaque ouverture (erreur et tracé repartent de zéro). */
function SignatureReminderBody({ heuresLastMonth }: SignatureReminderBodyProps) {
  const padRef = useRef<SignaturePadHandle>(null)
  const [emptyError, setEmptyError] = useState('')
  const createSignature = useCreateSignatureMutation()

  const saving = createSignature.isPending
  const error =
    emptyError ||
    (createSignature.isError
      ? createSignature.error.message || "Erreur lors de l'enregistrement de la signature"
      : '')

  const handleSubmit = () => {
    setEmptyError('')
    createSignature.reset()

    const signatureBase64 = padRef.current?.toDataURL() ?? null
    if (!signatureBase64) {
      setEmptyError('Veuillez dessiner votre signature avant de valider.')
      return
    }

    createSignature.mutate(
      { signatureBase64, date: new Date().toISOString(), heuresSignees: heuresLastMonth },
      {
        onSuccess: () =>
          toast.success('Merci !', {
            description: 'Signature enregistrée avec succès',
            duration: 5000,
          }),
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FilePenLine className="size-5" />
          </div>
          Signature de vos heures
        </DialogTitle>
        <DialogDescription>
          Veuillez signer pour valider vos heures du mois dernier. Cette signature est obligatoire.
        </DialogDescription>
      </DialogHeader>

      {/* Récapitulatif des heures */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center gap-3">
          <Clock className="size-5 text-primary" />
          <span className="text-sm font-medium text-foreground">Heures du mois dernier</span>
        </div>
        <span className="font-mono text-lg font-bold text-primary">
          {formatHoursMinutes(heuresLastMonth)}
        </span>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <SignaturePad ref={padRef} disabled={saving} />

      <DialogFooter>
        <Button type="button" className="w-full" disabled={saving} onClick={handleSubmit}>
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
          Valider ma signature
        </Button>
      </DialogFooter>
    </>
  )
}
