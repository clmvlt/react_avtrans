import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import type { AbsenceDTO } from '@/models'
import { getTodayDate } from '@/utils/timeFormatters'
import { useAbsenceTypesQuery } from '../../api/useAbsenceTypesQuery'
import { useCreateAbsenceForUserMutation } from '../../api/useCreateAbsenceForUserMutation'
import { useUpdateAbsenceByAdminMutation } from '../../api/useUpdateAbsenceByAdminMutation'
import { formatHeures, hasHeuresForcees } from '../../lib/absenceDecompte'
import { errorMessage } from '../../lib/errorMessage'
import {
  CUSTOM_ABSENCE_TYPE,
  adminAbsenceCreateSchema,
  adminAbsenceEditSchema,
  type AbsenceFormValues,
} from '../../schemas/absence'
import { AbsenceFormFields } from '../AbsenceFormFields'
import { ApproveDirectlyField } from '../ApproveDirectlyField'
import { EmployeeComboboxField } from '../EmployeeComboboxField'
import { FormErrorAlert } from '../FormErrorAlert'

type AbsenceFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Absence à modifier ; `null` : création. */
  absence: AbsenceDTO | null
  /** Après enregistrement (la page recharge sa liste). */
  onSaved: () => void
}

/** Création ou modification d'une absence par un admin (port d'`AbsenceEditModal.vue`). */
export function AbsenceFormDialog({
  open,
  onOpenChange,
  absence,
  onSaved,
}: AbsenceFormDialogProps) {
  const isEditMode = !!absence?.uuid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Modifier l'absence" : 'Nouvelle absence'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifier les informations de l'absence"
              : 'Créer une nouvelle absence pour un employé'}
          </DialogDescription>
        </DialogHeader>
        {/* Monté à chaque ouverture : formulaire et erreurs repartent de zéro. */}
        <AbsenceFormBody
          key={absence?.uuid ?? 'new'}
          absence={absence}
          onClose={() => onOpenChange(false)}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  )
}

type AbsenceFormBodyProps = {
  absence: AbsenceDTO | null
  onClose: () => void
  onSaved: () => void
}

/** Valeurs initiales : absence existante, ou aujourd'hui (date UTC du Vue, bug B-01 conservé). */
function getDefaultValues(absence: AbsenceDTO | null): AbsenceFormValues {
  if (absence?.uuid) {
    return {
      userUuid: absence.user?.uuid || '',
      startDate: absence.startDate ? (String(absence.startDate).split('T')[0] ?? '') : '',
      endDate: absence.endDate ? (String(absence.endDate).split('T')[0] ?? '') : '',
      period: absence.period || 'FULL_DAY',
      absenceTypeUuid: absence.customType ? CUSTOM_ABSENCE_TYPE : absence.absenceType?.uuid || '',
      customType: absence.customType || '',
      reason: absence.reason || '',
      approved: false,
    }
  }
  const today = getTodayDate()
  return {
    userUuid: '',
    startDate: today,
    endDate: today,
    period: 'FULL_DAY',
    absenceTypeUuid: '',
    customType: '',
    reason: '',
    approved: false,
  }
}

function AbsenceFormBody({ absence, onClose, onSaved }: AbsenceFormBodyProps) {
  const isEditMode = !!absence?.uuid
  const typesQuery = useAbsenceTypesQuery()
  const usersQuery = useUsersQuery({ enabled: !isEditMode })
  const createAbsence = useCreateAbsenceForUserMutation()
  const updateAbsence = useUpdateAbsenceByAdminMutation()

  const form = useForm<AbsenceFormValues>({
    resolver: zodResolver(isEditMode ? adminAbsenceEditSchema : adminAbsenceCreateSchema),
    defaultValues: getDefaultValues(absence),
  })

  const saving = createAbsence.isPending || updateAbsence.isPending
  const loading = typesQuery.isPending || (!isEditMode && usersQuery.isPending)
  const saveError = createAbsence.error ?? updateAbsence.error
  const loadError = typesQuery.error ?? (isEditMode ? null : usersQuery.error)
  const error = saveError
    ? errorMessage(
        saveError,
        isEditMode ? 'Erreur lors de la modification' : 'Erreur lors de la création',
      )
    : loadError
      ? errorMessage(loadError, 'Erreur lors du chargement')
      : ''

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  const onError = (err: unknown) =>
    toast.error('Erreur', {
      description: errorMessage(
        err,
        isEditMode ? 'Erreur lors de la modification' : 'Erreur lors de la création',
      ),
    })

  const onSubmit = (values: AbsenceFormValues) => {
    const isCustom = values.absenceTypeUuid === CUSTOM_ABSENCE_TYPE

    if (isEditMode && absence?.uuid) {
      // Mise à jour partielle : `null` pour effacer le type ou le motif
      updateAbsence.mutate(
        {
          uuid: absence.uuid,
          data: {
            startDate: values.startDate,
            endDate: values.endDate,
            period: values.period,
            absenceTypeUuid: isCustom ? null : values.absenceTypeUuid,
            customType: isCustom ? values.customType.trim() : null,
            reason: values.reason.trim() || null,
          },
        },
        {
          onSuccess: () => {
            onSaved()
            toast.success('Succès', { description: 'Absence modifiée avec succès' })
            onClose()
          },
          onError,
        },
      )
      return
    }

    createAbsence.mutate(
      {
        userUuid: values.userUuid,
        startDate: values.startDate,
        endDate: values.endDate,
        period: values.period,
        absenceTypeUuid: isCustom ? undefined : values.absenceTypeUuid,
        customType: isCustom ? values.customType.trim() : undefined,
        // Motif non « trimé » en création, comme le Vue
        reason: values.reason || undefined,
        approved: values.approved,
      },
      {
        onSuccess: () => {
          onSaved()
          toast.success('Succès', { description: 'Absence créée avec succès' })
          onClose()
        },
        onError,
      },
    )
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && <FormErrorAlert message={error} />}

      {isEditMode && absence?.user && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
          <UserAvatar user={absence.user} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {absence.user.firstName} {absence.user.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{absence.user.email}</span>
          </div>
        </div>
      )}

      {!isEditMode && (
        <Controller
          name="userUuid"
          control={form.control}
          render={({ field: { onChange, ...field }, fieldState }) => (
            <EmployeeComboboxField
              {...field}
              disabled={saving}
              error={fieldState.error?.message}
              onValueChange={onChange}
            />
          )}
        />
      )}

      <AbsenceFormFields
        control={form.control}
        absenceTypes={typesQuery.data ?? []}
        disabled={saving}
        variant="admin"
      />

      {!isEditMode && (
        <Controller
          name="approved"
          control={form.control}
          render={({ field }) => (
            <ApproveDirectlyField
              checked={field.value}
              onCheckedChange={field.onChange}
              description="L'absence sera validée sans attente"
              disabled={saving}
            />
          )}
        />
      )}

      {isEditMode && absence && hasHeuresForcees(absence) && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
          <CircleAlert className="size-4 shrink-0" />
          Heures fixées à la main ({formatHeures(absence.heuresForcees)}) : elles repasseront au
          calcul automatique si vous changez les dates, la période ou le type.
        </div>
      )}

      {isEditMode && absence?.status === 'REJECTED' && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <CircleAlert className="size-4 shrink-0" />
          La modification repassera cette absence en statut « En attente »
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          {isEditMode ? 'Enregistrer' : "Créer l'absence"}
        </Button>
      </DialogFooter>
    </form>
  )
}
