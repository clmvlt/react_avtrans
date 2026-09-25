import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
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
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { useCreateAppVersionMutation } from '../api/useCreateAppVersionMutation'
import { useApkFileReader } from '../hooks/useApkFileReader'
import { createAppVersionSchema, type CreateAppVersionFormValues } from '../schemas/appVersionForms'
import { ApkFilePicker } from './ApkFilePicker'
import { AppVersionFormError } from './AppVersionFormError'

type AppVersionCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Dialog « Nouvelle version » : APK (lu en base64), code, nom et notes de version.
 * Comme le Vue, tout est remis à zéro à chaque ouverture : une nouvelle instance du dialog est
 * créée à chaque passage de fermé à ouvert.
 */
export function AppVersionCreateDialog({ open, onOpenChange }: AppVersionCreateDialogProps) {
  const [session, setSession] = useState(0)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSession((current) => current + 1)
  }

  return <CreateDialog key={session} open={open} onOpenChange={onOpenChange} />
}

function CreateDialog({ open, onOpenChange }: AppVersionCreateDialogProps) {
  const createVersion = useCreateAppVersionMutation()
  const apk = useApkFileReader()
  const [error, setError] = useState('')

  const form = useForm<CreateAppVersionFormValues>({
    resolver: zodResolver(createAppVersionSchema),
    defaultValues: { versionCode: 1, versionName: '', changelog: '' },
  })
  const versionCode = useWatch({ control: form.control, name: 'versionCode' })
  const versionName = useWatch({ control: form.control, name: 'versionName' })

  const saving = createVersion.isPending
  // Mêmes conditions que le bouton du Vue
  const isFormValid =
    apk.file !== null && apk.base64 !== '' && versionCode > 0 && versionName.trim() !== ''

  // Fermeture (overlay, Échap, croix) bloquée pendant l'enregistrement ou la lecture du fichier
  const handleOpenChange = (next: boolean) => {
    if (!next && (saving || apk.isReading)) return
    onOpenChange(next)
  }

  const handleFilesSelected = ([file]: File[]) => {
    if (!file) return
    // Extension sensible à la casse, comme le Vue (« APP.APK » est refusé)
    if (!file.name.endsWith('.apk')) {
      setError('Veuillez sélectionner un fichier APK')
      return
    }
    setError('')
    void apk.read(file).then((ok) => {
      if (!ok) setError('Erreur lors de la lecture du fichier')
    })
  }

  const onSubmit = (values: CreateAppVersionFormValues) => {
    if (!isFormValid || !apk.file) return
    setError('')

    createVersion.mutate(
      {
        apkB64: apk.base64,
        versionCode: values.versionCode,
        versionName: values.versionName,
        originalFileName: apk.file.name,
        changelog: values.changelog || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Succès', { description: 'Version créée avec succès !' })
          onOpenChange(false)
        },
        onError: (err) => {
          const message =
            err instanceof Error ? err.message : 'Erreur lors de la création de la version'
          setError(message)
          toast.error('Erreur', { description: message })
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle version</DialogTitle>
          <DialogDescription>
            Uploadez un fichier APK et renseignez les informations de la version.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && <AppVersionFormError message={error} />}

          <ApkFilePicker
            file={apk.file}
            disabled={saving}
            isReading={apk.isReading}
            progress={apk.progress}
            onFilesSelected={handleFilesSelected}
            onError={setError}
            onRemove={apk.clear}
          />

          <Controller
            name="versionCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                value={Number.isNaN(field.value) ? '' : field.value}
                onChange={(event) => field.onChange(event.target.valueAsNumber)}
                label="Code de version"
                type="number"
                placeholder="10"
                required
                disabled={saving}
                hint="Numéro incrémental unique (ex: 10, 11, 12...)"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="versionName"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                label="Nom de version"
                placeholder="1.2.3"
                required
                disabled={saving}
                hint="Format sémantique (ex: 1.2.3)"
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="changelog"
            control={form.control}
            render={({ field }) => (
              <Field className="gap-2">
                <FieldLabel htmlFor="create-app-version-changelog">Notes de version</FieldLabel>
                <Textarea
                  {...field}
                  id="create-app-version-changelog"
                  placeholder="Décrivez les changements de cette version..."
                  rows={4}
                  disabled={saving}
                />
              </Field>
            )}
          />

          <DialogFooter>
            {/* Comme le Vue, « Annuler » ferme même pendant la lecture du fichier */}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={saving || apk.isReading || !isFormValid}>
              {saving && <LoaderCircle className="size-4 animate-spin" />}
              Créer la version
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
