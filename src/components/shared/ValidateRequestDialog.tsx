import { useId, useState, type ReactNode } from 'react'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type ValidateRequestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** `true` : approbation ; `false` : refus (champ « Motif du refus »). */
  approve: boolean
  title: ReactNode
  description: ReactNode
  /** Résumé de la demande (employé, période, montant…), au-dessus du motif. */
  children?: ReactNode
  /** Validation en cours (`mutation.isPending`) : boutons désactivés, spinner. */
  isPending?: boolean
  /** Motif obligatoire en cas de refus (`true` par défaut, comme absences et acomptes). */
  requireReason?: boolean
  /**
   * Appelé avec le motif du refus (`trim`), `undefined` pour une approbation. Si la promesse
   * renvoyée échoue, son message s'affiche dans le dialog (le toast reste à la charge de l'appelant).
   * Le dialog ne se ferme pas tout seul : le fermer dans le `onSuccess` de la mutation.
   */
  onConfirm: (rejectionReason: string | undefined) => Promise<unknown> | void
  /** Message affiché si l'erreur n'est pas une `Error` (« Erreur lors de la validation »). */
  errorFallback?: string
  className?: string
}

/**
 * Approbation / refus d'une demande (port d'`AbsenceValidateModal` et `AcompteValidateModal`) :
 * titre, description, résumé en `children`, motif du refus requis, « Annuler » / « Approuver » ou
 * « Refuser ». Le motif repart de zéro à chaque ouverture.
 *
 * @example
 * <ValidateRequestDialog
 *   open={dialogs.isOpen('approve') || dialogs.isOpen('reject')}
 *   onOpenChange={dialogs.onOpenChange}
 *   approve={dialogs.type === 'approve'}
 *   title="Approuver l'absence"
 *   description="Confirmer l'approbation de cette absence"
 *   isPending={validate.isPending}
 *   onConfirm={(reason) => validate.mutateAsync({ uuid, approved, rejectionReason: reason }, { onSuccess: dialogs.close })}
 * >
 *   <AbsenceValidateSummary absence={dialogs.item} />
 * </ValidateRequestDialog>
 */
export function ValidateRequestDialog({
  open,
  onOpenChange,
  isPending = false,
  className,
  title,
  description,
  ...props
}: ValidateRequestDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next && isPending) return
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn('max-h-[90dvh] overflow-y-auto sm:max-w-md', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {/* Contenu monté à chaque ouverture : motif et erreur repartent de zéro. */}
        <ValidateRequestBody
          isPending={isPending}
          onCancel={() => handleOpenChange(false)}
          {...props}
        />
      </DialogContent>
    </Dialog>
  )
}

type ValidateRequestBodyProps = Pick<
  ValidateRequestDialogProps,
  'approve' | 'children' | 'requireReason' | 'onConfirm' | 'errorFallback'
> & {
  isPending: boolean
  onCancel: () => void
}

function ValidateRequestBody({
  approve,
  children,
  requireReason = true,
  onConfirm,
  errorFallback = 'Erreur lors de la validation',
  isPending,
  onCancel,
}: ValidateRequestBodyProps) {
  const reasonId = useId()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const missingReason = !approve && requireReason && !reason.trim()

  const handleConfirm = async () => {
    if (missingReason) {
      setError('Veuillez indiquer le motif du refus')
      return
    }
    setError('')
    try {
      await onConfirm(approve ? undefined : reason.trim() || undefined)
    } catch (err) {
      setError(err instanceof Error ? err.message : errorFallback)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {children}

        {!approve && (
          <div className="flex flex-col gap-2">
            <label htmlFor={reasonId} className="text-sm font-medium text-foreground">
              Motif du refus{requireReason && ' *'}
            </label>
            <Textarea
              id={reasonId}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Indiquez le motif du refus..."
              rows={3}
              disabled={isPending}
              className="min-h-20"
            />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
          >
            <CircleAlert className="size-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Annuler
        </Button>
        <Button
          type="button"
          variant={approve ? 'default' : 'destructive'}
          disabled={isPending || missingReason}
          onClick={() => void handleConfirm()}
        >
          {isPending && <LoaderCircle className="size-4 animate-spin" />}
          {approve ? 'Approuver' : 'Refuser'}
        </Button>
      </DialogFooter>
    </>
  )
}
