import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, RotateCcw } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { AbsenceDTO } from '@/models'
import { useSetAbsenceHeuresMutation } from '../../api/useSetAbsenceHeuresMutation'
import { formatHeures, formatJoursDecomptes, hasHeuresForcees } from '../../lib/absenceDecompte'
import { formatDateLong } from '../../lib/dateFormat'
import { errorMessage } from '../../lib/errorMessage'
import {
  absenceHeuresSchema,
  parseHeures,
  type AbsenceHeuresFormValues,
} from '../../schemas/absenceHeures'
import { SummaryRow } from '../SummaryRow'

type AbsenceHeuresDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  absence: AbsenceDTO | null
  onSaved: () => void
}

/**
 * [ADMIN] Heures créditées par une absence fixées à la main, quel que soit son statut, ou retour
 * au calcul automatique (D8).
 */
export function AbsenceHeuresDialog({
  open,
  onOpenChange,
  absence,
  onSaved,
}: AbsenceHeuresDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Heures de l&apos;absence</DialogTitle>
          <DialogDescription>
            Fixez à la main les heures créditées par cette absence, ou revenez au calcul automatique
            (contrat, type d&apos;absence et jours fériés).
          </DialogDescription>
        </DialogHeader>
        {absence && (
          <AbsenceHeuresForm
            key={absence.uuid}
            absence={absence}
            onClose={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type AbsenceHeuresFormProps = {
  absence: AbsenceDTO
  onClose: () => void
  onSaved: () => void
}

function AbsenceHeuresForm({ absence, onClose, onSaved }: AbsenceHeuresFormProps) {
  const id = useId()
  const setHeures = useSetAbsenceHeuresMutation()
  const forced = hasHeuresForcees(absence)

  const form = useForm<AbsenceHeuresFormValues>({
    resolver: zodResolver(absenceHeuresSchema),
    defaultValues: {
      heures: String(absence.heuresForcees ?? absence.heures ?? 0).replace('.', ','),
    },
  })

  const save = (heures: number | null) => {
    if (!absence.uuid) return
    setHeures.mutate(
      { uuid: absence.uuid, heures },
      {
        onSuccess: () => {
          onSaved()
          toast.success('Succès', {
            description:
              heures === null
                ? 'Heures recalculées automatiquement'
                : "Heures de l'absence modifiées",
          })
          onClose()
        },
        onError: (err) =>
          toast.error('Erreur', {
            description: errorMessage(err, "Erreur lors de l'enregistrement des heures"),
          }),
      },
    )
  }

  const onSubmit = (values: AbsenceHeuresFormValues) => save(parseHeures(values.heures))
  const saving = setHeures.isPending

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
        <SummaryRow label="Employé">
          {absence.user?.firstName} {absence.user?.lastName}
        </SummaryRow>
        <SummaryRow label="Période">
          {formatDateLong(absence.startDate)}
          {absence.startDate !== absence.endDate && (
            <span> → {formatDateLong(absence.endDate)}</span>
          )}
        </SummaryRow>
        <SummaryRow label="Calcul automatique">
          {formatJoursDecomptes(absence.joursDecomptes, absence.modeDecompte)} ·{' '}
          {formatHeures(absence.heuresCalculees)}
        </SummaryRow>
      </div>

      <Controller
        name="heures"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={`${id}-heures`}>Heures créditées *</FieldLabel>
            <Input
              {...field}
              id={`${id}-heures`}
              type="text"
              inputMode="decimal"
              placeholder="Ex : 35 ou 29,17"
              disabled={saving}
              aria-invalid={fieldState.invalid}
            />
            <FieldDescription>
              Remises au calcul automatique si les dates, la période ou le type changent.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <DialogFooter>
        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
          Annuler
        </Button>
        {forced && (
          <Button type="button" variant="outline" disabled={saving} onClick={() => save(null)}>
            <RotateCcw className="size-4" />
            Calcul automatique
          </Button>
        )}
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  )
}
