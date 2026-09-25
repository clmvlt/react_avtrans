import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { useUpdateNotificationPreferencesMutation } from '../api/useUpdateNotificationPreferencesMutation'
import {
  NOTIFICATION_CHANNEL_OPTIONS,
  getVisiblePreferenceFields,
  type NotificationPreferencesValues,
} from '../lib/notificationChannels'
import {
  notificationPreferencesSchema,
  type NotificationPreferencesFormValues,
} from '../schemas/notificationPreferences'

type NotificationPreferencesFormProps = {
  preferences: NotificationPreferencesValues
  isAdmin: boolean
  /** Retour en lecture (après « Annuler » ou un enregistrement réussi) */
  onDone: () => void
}

/**
 * Préférences de notification en édition : un canal par type d'événement.
 * Les six clés sont toujours envoyées ; pour un non-admin, `serviceModification` (masquée) part
 * avec sa valeur affichée, « SITE » par défaut si l'API ne la renvoyait pas (comme le Vue).
 */
export function NotificationPreferencesForm({
  preferences,
  isAdmin,
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
        {getVisiblePreferenceFields(isAdmin).map((preference) => (
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

      <div className="mt-4 flex justify-end gap-3 border-t pt-4 max-sm:flex-col">
        {/* type="button" : sans lui, « Annuler » enregistrerait le formulaire (MIGRATION.md 8.1) */}
        <Button type="button" variant="outline" size="sm" onClick={onDone} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Sauvegarder
        </Button>
      </div>
    </form>
  )
}
