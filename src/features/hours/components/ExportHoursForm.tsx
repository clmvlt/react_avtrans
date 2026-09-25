import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, LoaderCircle } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import type { UserDTO } from '@/models'
import { useExportHoursMutation } from '../api/useExportHoursMutation'
import {
  getDefaultExportPeriod,
  getExportPresetPeriod,
  type ExportPeriodPreset,
} from '../lib/periodPresets'
import { exportHoursSchema, type ExportHoursFormValues } from '../schemas/exportHours'
import { ExportPeriodFields } from './ExportPeriodFields'
import { ExportStatusMessage } from './ExportStatusMessage'
import { UserMultiSelectList } from './UserMultiSelectList'

const SUCCESS_MESSAGE_DURATION = 5000

type ExportHoursFormProps = {
  /** GET /users (masqués compris, filtrés par la liste de sélection). */
  users: UserDTO[]
}

const createDefaultValues = (): ExportHoursFormValues => ({
  ...getDefaultExportPeriod(),
  userUuids: [],
})

/**
 * Carte « Paramètres d'export » : période, utilisateurs, export Excel. Le résultat s'affiche en
 * bandeau en tête de la carte, comme le Vue (succès masqué au bout de 5 s ; erreur conservée
 * jusqu'au prochain export).
 */
export function ExportHoursForm({ users }: ExportHoursFormProps) {
  const exportHours = useExportHoursMutation()
  const [defaultValues] = useState(createDefaultValues)
  const form = useForm<ExportHoursFormValues>({
    resolver: zodResolver(exportHoursSchema),
    defaultValues,
  })
  const selectedUuids = useWatch({ control: form.control, name: 'userUuids' })
  const exporting = exportHours.isPending

  // Minuterie du message de succès (nettoyée au démontage ou au prochain export)
  const { isSuccess, reset: clearExportResult } = exportHours
  useEffect(() => {
    if (!isSuccess) return
    const timer = window.setTimeout(clearExportResult, SUCCESS_MESSAGE_DURATION)
    return () => window.clearTimeout(timer)
  }, [isSuccess, clearExportResult])

  const applyPreset = (preset: ExportPeriodPreset) => {
    const { startDate, endDate } = getExportPresetPeriod(preset)
    const options = { shouldValidate: form.formState.isSubmitted }
    form.setValue('startDate', startDate, options)
    form.setValue('endDate', endDate, options)
  }

  const onSubmit = (values: ExportHoursFormValues) => {
    exportHours.mutate({
      userUuids: values.userUuids,
      startDate: values.startDate,
      endDate: values.endDate,
    })
  }

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold text-foreground">Paramètres d&apos;export</h2>

      {exportHours.isSuccess && (
        <ExportStatusMessage variant="success">
          Export réussi ! Le fichier a été téléchargé.
        </ExportStatusMessage>
      )}
      {exportHours.isError && (
        <ExportStatusMessage variant="error">
          {exportHours.error instanceof Error && exportHours.error.message
            ? exportHours.error.message
            : "Erreur lors de l'export"}
        </ExportStatusMessage>
      )}

      <form noValidate className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <ExportPeriodFields control={form.control} disabled={exporting} onPreset={applyPreset} />

        <Controller
          name="userUuids"
          control={form.control}
          render={({ field, fieldState }) => (
            <UserMultiSelectList
              users={users}
              value={field.value}
              onChange={field.onChange}
              disabled={exporting}
              error={fieldState.error?.message}
            />
          )}
        />

        <div>
          <Button
            type="submit"
            className="w-full"
            disabled={selectedUuids.length === 0 || exporting}
          >
            {exporting ? (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {exporting ? 'Export en cours...' : 'Exporter en Excel'}
          </Button>
        </div>
      </form>
    </div>
  )
}
