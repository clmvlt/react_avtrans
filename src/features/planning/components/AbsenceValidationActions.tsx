import { useId } from 'react'
import { Check, LoaderCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type AbsenceValidationActionsProps = {
  showRejectInput: boolean
  onStartReject: () => void
  rejectionReason: string
  onRejectionReasonChange: (value: string) => void
  isValidating: boolean
  onApprove: () => void
  onConfirmReject: () => void
  onCancelReject: () => void
}

/**
 * Actions d'une absence en attente : « Approuver » et « Refuser » ; « Refuser » ouvre le motif
 * (optionnel) avec « Confirmer le refus » et « Annuler ».
 */
export function AbsenceValidationActions({
  showRejectInput,
  onStartReject,
  rejectionReason,
  onRejectionReasonChange,
  isValidating,
  onApprove,
  onConfirmReject,
  onCancelReject,
}: AbsenceValidationActionsProps) {
  const reasonId = useId()

  return (
    <div className="-mx-6 space-y-3 bg-amber-500/5 px-6 py-4">
      <h4 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Actions
      </h4>

      {showRejectInput ? (
        <div className="space-y-3">
          <label htmlFor={reasonId} className="text-sm font-medium text-muted-foreground">
            Motif du refus (optionnel)
          </label>
          <Textarea
            id={reasonId}
            value={rejectionReason}
            onChange={(event) => onRejectionReasonChange(event.target.value)}
            placeholder="Indiquez la raison du refus..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onCancelReject}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isValidating}
              onClick={onConfirmReject}
            >
              {isValidating && <LoaderCircle className="size-4 animate-spin" />}
              Confirmer le refus
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button type="button" disabled={isValidating} onClick={onApprove}>
            {isValidating ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Approuver
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isValidating}
            onClick={onStartReject}
          >
            <X className="size-4" />
            Refuser
          </Button>
        </div>
      )}
    </div>
  )
}
