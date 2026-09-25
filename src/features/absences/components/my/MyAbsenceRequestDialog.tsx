import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
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
import { getTodayDate } from '@/utils/timeFormatters'
import { useAbsenceTypesQuery } from '../../api/useAbsenceTypesQuery'
import { useCreateAbsenceRequestMutation } from '../../api/useCreateAbsenceRequestMutation'
import { errorMessage } from '../../lib/errorMessage'
import {
  CUSTOM_ABSENCE_TYPE,
  myAbsenceRequestSchema,
  type AbsenceFormValues,
} from '../../schemas/absence'
import { AbsenceFormFields } from '../AbsenceFormFields'
import { FormErrorAlert } from '../FormErrorAlert'

type MyAbsenceRequestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Après l'envoi (la page recharge la première page). */
  onSaved: () => void
}

/** Nouvelle demande d'absence de l'employé (port de `MyAbsenceEditModal.vue`). */
export function MyAbsenceRequestDialog({
  open,
  onOpenChange,
  onSaved,
}: MyAbsenceRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle demande d&apos;absence</DialogTitle>
          <DialogDescription>
            Envoyer une demande d&apos;absence à votre responsable
          </DialogDescription>
        </DialogHeader>
        {/* Monté à chaque ouverture : formulaire et erreurs repartent de zéro. */}
        <MyAbsenceRequestBody onClose={() => onOpenChange(false)} onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  )
}

type MyAbsenceRequestBodyProps = {
  onClose: () => void
  onSaved: () => void
}

function MyAbsenceRequestBody({ onClose, onSaved }: MyAbsenceRequestBodyProps) {
  const typesQuery = useAbsenceTypesQuery()
  const createRequest = useCreateAbsenceRequestMutation()
  const saving = createRequest.isPending

  // Date du jour calculée en UTC comme le Vue (veille entre 0 h et 2 h : bug B-01 conservé)
  const today = getTodayDate()
  const form = useForm<AbsenceFormValues>({
    resolver: zodResolver(myAbsenceRequestSchema),
    defaultValues: {
      userUuid: '',
      startDate: today,
      endDate: today,
      period: 'FULL_DAY',
      absenceTypeUuid: '',
      customType: '',
      reason: '',
      approved: false,
    },
  })

  if (typesQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  const error = createRequest.isError
    ? errorMessage(createRequest.error, "Erreur lors de l'envoi de la demande")
    : typesQuery.isError
      ? errorMessage(typesQuery.error, 'Erreur lors du chargement')
      : ''

  const onSubmit = (values: AbsenceFormValues) => {
    const isCustom = values.absenceTypeUuid === CUSTOM_ABSENCE_TYPE
    createRequest.mutate(
      {
        startDate: values.startDate,
        endDate: values.endDate,
        period: values.period,
        absenceTypeUuid: isCustom ? undefined : values.absenceTypeUuid,
        customType: isCustom ? values.customType.trim() : undefined,
        reason: values.reason || undefined,
      },
      {
        onSuccess: () => {
          onSaved()
          toast.success('Succès', { description: "Demande d'absence envoyée avec succès" })
          onClose()
        },
        onError: (err) =>
          toast.error('Erreur', {
            description: errorMessage(err, "Erreur lors de l'envoi de la demande"),
          }),
      },
    )
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <FormErrorAlert message={error} />}

      <AbsenceFormFields
        control={form.control}
        absenceTypes={typesQuery.data ?? []}
        disabled={saving}
        variant="my"
      />

      <DialogFooter>
        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          Envoyer la demande
        </Button>
      </DialogFooter>
    </form>
  )
}
