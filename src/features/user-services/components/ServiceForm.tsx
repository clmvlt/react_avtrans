import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LoaderCircle, Pause, Play, Square } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { CheckboxCard } from '@/features/users/components/CheckboxCard'
import { cn } from '@/lib/utils'
import { getCurrentTime, getTodayDate } from '@/utils/timeFormatters'
import {
  formatDurationLabel,
  getDurationMinutes,
  nextDayKey,
  toServicePayload,
  type AdminServicePayload,
  type ServiceCoordinates,
} from '../lib/serviceForm'
import { serviceFormSchema, type ServiceFormValues } from '../schemas/serviceForm'
import { DateTimeFields } from './DateTimeFields'
import { ServiceTypeToggle } from './ServiceTypeToggle'

type ServiceFormProps = {
  isEdit: boolean
  defaultValues: ServiceFormValues
  coordinates: ServiceCoordinates
  isPending: boolean
  /** Envoi ; `onError` affiche le message sous le formulaire. */
  onSubmit: (payload: AdminServicePayload, onError: (message: string) => void) => void
  onCancel: () => void
}

/** Formulaire d'un pointage (création ou modification), monté à chaque ouverture du dialog. */
export function ServiceForm({
  isEdit,
  defaultValues,
  coordinates,
  isPending,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const [formError, setFormError] = useState('')
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
  })
  const [isBreak, hasEnd, debutDate, debutTime, finDate, finTime] = useWatch({
    control: form.control,
    name: ['isBreak', 'hasEnd', 'debutDate', 'debutTime', 'finDate', 'finTime'],
  })

  const duration = getDurationMinutes({ hasEnd, debutDate, debutTime, finDate, finTime })
  const durationLabel = formatDurationLabel(duration)
  const durationInvalid = duration !== null && duration < 0
  const TypeIcon = isBreak ? Pause : Play

  // Cocher « terminé » préremplit la fin pour ne jamais laisser un champ vide
  const toggleHasEnd = (checked: boolean) => {
    form.setValue('hasEnd', checked)
    if (!checked) return
    const values = form.getValues()
    if (!values.finDate) form.setValue('finDate', values.debutDate || getTodayDate())
    if (!values.finTime) form.setValue('finTime', values.debutTime || getCurrentTime())
  }

  // Service de nuit : fin avancée d'un jour
  const setEndNextDay = () => {
    const next = nextDayKey(form.getValues())
    if (next) form.setValue('finDate', next, { shouldValidate: form.formState.isSubmitted })
  }

  const submit = (values: ServiceFormValues) => {
    setFormError('')
    onSubmit(toServicePayload(values, coordinates), setFormError)
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(submit)} className="space-y-4">
      <Controller
        name="isBreak"
        control={form.control}
        render={({ field }) => (
          <ServiceTypeToggle isBreak={field.value} onChange={field.onChange} readOnly={isEdit} />
        )}
      />

      <DateTimeFields
        control={form.control}
        dateName="debutDate"
        timeName="debutTime"
        dateLabel="Date de début"
        timeLabel="Heure de début"
        header={
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TypeIcon className={cn('size-4', isBreak ? 'text-amber-500' : 'text-green-500')} />
            <span>Début</span>
          </div>
        }
      />

      <CheckboxCard
        checked={hasEnd}
        onCheckedChange={toggleHasEnd}
        label={isBreak ? 'Pause terminée' : 'Service terminé'}
        description={
          hasEnd ? "Renseignez la date et l'heure de fin" : 'En cours — aucune heure de fin'
        }
      />

      {hasEnd && (
        <div className="space-y-2">
          <DateTimeFields
            control={form.control}
            dateName="finDate"
            timeName="finTime"
            dateLabel="Date de fin"
            timeLabel="Heure de fin"
            header={
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Square className="size-4 text-muted-foreground" />
                  <span>Fin</span>
                </div>
                {durationLabel && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                    {durationLabel}
                  </span>
                )}
              </div>
            }
          />
          {durationInvalid && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <CircleAlert className="size-3.5 shrink-0" />
                La fin précède le début.
              </span>
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={setEndNextDay}
              >
                Terminer le lendemain
              </button>
            </div>
          )}
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <CircleAlert className="size-4 shrink-0" />
          {formError}
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
          {isEdit ? 'Enregistrer' : 'Créer'}
        </Button>
      </DialogFooter>
    </form>
  )
}
