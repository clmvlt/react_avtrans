import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { useUpdateNotificationPreferencesMutation } from '../api/useUpdateNotificationPreferencesMutation'
import {
  NOTIFICATION_CHANNEL_OPTIONS,
  NOTIFICATION_PREFERENCE_FIELDS,
  type NotificationPreferencesValues,
} from '../lib/notificationChannels'
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormValues,
} from '../schemas/notificationPreferences'

type NotificationPreferencesFormProps = {
  preferences: NotificationPreferencesValues
  /** Retour en lecture (après « Annuler » ou un enregistrement réussi) */
  onDone: () => void
}

/**
 * Préférences de notification en édition : un canal par type d'événement.
 * Les six clés sont toujours envoyées ; `serviceModification` (plus affichée) part avec sa valeur
 * reçue, « SITE » par défaut si l'API ne la renvoyait pas (comme le Vue).
 */
export function NotificationPreferencesForm({
  preferences,
  onDone,
}: NotificationPreferencesFormProps) {
  const updatePreferences = useUpdateNotificationPreferencesMutation()
  const saving = updatePreferences.isPending

  const form = useForm<NotificationPreferencesFormValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: preferences,
  })

  const onSubmit = (values: NotificationPreferencesFormValues) => {
    updatePreferences.mutate(values, {
      onSuccess: () => {
        onDone()
        toast.success('Succès', { description: 'Préférences de notifications mises à jour' })
      },
      onError: (err) => {
        toast.error('Erreur', {
          description:
            err instanceof Error ? err.message : 'Erreur lors de la mise à jour des préférences',
        })
      },
    })
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <p className="text-sm text-muted-foreground">
        Choisissez comment vous souhaitez être notifié pour chaque type d'événement.
      </p>

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        {NOTIFICATION_PREFERENCE_FIELDS.map((preference) => (
          <Controller
            key={preference.key}
            name={preference.key}
            control={form.control}
            render={({ field, fieldState }) => (
              <Combobox
                ref={field.ref}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur}
                label={preference.label}
                options={NOTIFICATION_CHANNEL_OPTIONS}
                hint={preference.hint}
                error={fieldState.error?.message}
              />
            )}
          />
        ))}
      </div>

      <div className="mt-2 flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
        {/* type="button" : sans lui, « Annuler » enregistrerait le formulaire (MIGRATION.md 8.1) */}
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}
