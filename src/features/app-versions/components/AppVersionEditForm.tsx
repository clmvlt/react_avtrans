import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogFooter } from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { AppVersionDTO } from '@/models'
import { useUpdateAppVersionMutation } from '../api/useUpdateAppVersionMutation'
import { editAppVersionSchema, type EditAppVersionFormValues } from '../schemas/appVersionForms'
import { AppVersionFormError } from './AppVersionFormError'
import { AppVersionSummary } from './AppVersionSummary'

type AppVersionEditFormProps = {
  version: AppVersionDTO
  onClose: () => void
}

/** Formulaire du dialog « Modifier la version » : statut actif et notes de version. */
export function AppVersionEditForm({ version, onClose }: AppVersionEditFormProps) {
  const updateVersion = useUpdateAppVersionMutation()
  const saving = updateVersion.isPending

  const form = useForm<EditAppVersionFormValues>({
    resolver: zodResolver(editAppVersionSchema),
    defaultValues: { changelog: version.changelog || '', isActive: version.isActive },
  })

  const onSubmit = ({ changelog, isActive }: EditAppVersionFormValues) => {
    updateVersion.mutate(
      // Notes vidées envoyées `undefined` : l'API les ignore, impossible de les effacer
      // (limite connue, MIGRATION.md 8.3), comme dans le Vue
      { id: version.id, data: { changelog: changelog || undefined, isActive } },
      {
        onSuccess: () => {
          toast.success('Succès', { description: 'Version modifiée avec succès !' })
          onClose()
        },
        onError: (err) => {
          toast.error('Erreur', {
            description:
              err instanceof Error ? err.message : 'Erreur lors de la modification de la version',
          })
        },
      },
    )
  }

  const submitError = updateVersion.isError
    ? updateVersion.error instanceof Error
      ? updateVersion.error.message
      : 'Erreur lors de la modification de la version'
    : ''

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {submitError && <AppVersionFormError message={submitError} />}

      <AppVersionSummary version={version} />

      <Controller
        name="isActive"
        control={form.control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50 has-[[data-state=checked]]:border-primary/30 has-[[data-state=checked]]:bg-primary/5">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              onBlur={field.onBlur}
              ref={field.ref}
              disabled={saving}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm leading-none font-medium">Version active</span>
              <span className="text-xs text-muted-foreground">
                Les versions inactives ne sont pas visibles publiquement
              </span>
            </div>
          </label>
        )}
      />

      <Controller
        name="changelog"
        control={form.control}
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor="edit-app-version-changelog">Notes de version</FieldLabel>
            <Textarea
              {...field}
              id="edit-app-version-changelog"
              placeholder="Décrivez les changements de cette version..."
              rows={4}
              disabled={saving}
            />
          </Field>
        )}
      />

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          Enregistrer
        </Button>
      </DialogFooter>
    </form>
  )
}
