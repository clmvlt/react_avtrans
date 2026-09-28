import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { addDaysToKey, todayLocalISO } from '@/lib/dates'
import type { VehiculeRelaiDTO } from '@/models'
import { useSaveRelaiMutation } from '../../api/useSaveRelaiMutation'
import { getErrorMessage } from '../../lib/errors'
import { formatDateShort, formatNumber } from '../../lib/formatters'
import { getRelaiCurrentKm } from '../../lib/relais'
import {
  buildEndRelaiSchema,
  toEndRelaiPayload,
  type EndRelaiFormValues,
} from '../../schemas/relai'
import { FormErrorBanner } from '../FormErrorBanner'

type RelaiEndDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculeId: string
  relai: VehiculeRelaiDTO | null
}

/**
 * « Terminer le relais » (D9) : date de fin (aujourd'hui par défaut) et km au retour, prérempli
 * avec le dernier relevé du relais. Le véhicule reprend ses propres relevés dès le lendemain.
 */
export function RelaiEndDialog({ open, onOpenChange, vehiculeId, relai }: RelaiEndDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        {relai && (
          <RelaiEndForm vehiculeId={vehiculeId} relai={relai} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

type RelaiEndFormProps = {
  vehiculeId: string
  relai: VehiculeRelaiDTO
  onClose: () => void
}

function RelaiEndForm({ vehiculeId, relai, onClose }: RelaiEndFormProps) {
  const saveRelai = useSaveRelaiMutation(vehiculeId)
  const currentKm = getRelaiCurrentKm(relai)
  const today = todayLocalISO()
  const form = useForm<EndRelaiFormValues>({
    resolver: zodResolver(buildEndRelaiSchema(relai)),
    defaultValues: {
      // Un relais prévu plus tard ne peut pas finir avant d'avoir commencé
      dateFin: relai.dateFin ?? (today < relai.dateDebut ? relai.dateDebut : today),
      kmFin: relai.kmFin != null ? String(relai.kmFin) : currentKm != null ? String(currentKm) : '',
    },
    mode: 'onTouched',
  })
  const saving = saveRelai.isPending

  const onSubmit = (values: EndRelaiFormValues) => {
    saveRelai.mutate(
      { relaiId: relai.id, relai: toEndRelaiPayload(relai, values) },
      {
        onSuccess: () => {
          const vehicle = relai.vehiculeImmat ?? 'Le véhicule'
          toast.success('Relais terminé', {
            description:
              values.dateFin === today
                ? `${vehicle} reprend ses propres kilométrages demain.`
                : `${vehicle} reprend ses propres kilométrages le ${formatDateShort(addDaysToKey(values.dateFin, 1))}.`,
          })
          onClose()
        },
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="size-5" />
          </div>
          Terminer le relais
        </DialogTitle>
        <DialogDescription>
          Le véhicule est revenu : le relais{' '}
          <span className="font-semibold tracking-wide text-foreground uppercase">
            {relai.immat}
          </span>{' '}
          s&apos;arrête à la date de fin, incluse.
        </DialogDescription>
      </DialogHeader>

      {saveRelai.isError && (
        <FormErrorBanner>
          {getErrorMessage(saveRelai.error, 'Erreur lors de la sauvegarde')}
        </FormErrorBanner>
      )}

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="dateFin"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              type="date"
              label="Dernier jour du relais"
              required
              min={relai.dateDebut}
              disabled={saving}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="kmFin"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              type="number"
              inputMode="numeric"
              min={0}
              label="Km du relais au retour"
              hint={
                currentKm != null
                  ? `Dernier kilométrage connu : ${formatNumber(currentKm)} km`
                  : undefined
              }
              disabled={saving}
              error={fieldState.error?.message}
            />
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Terminer le relais
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
