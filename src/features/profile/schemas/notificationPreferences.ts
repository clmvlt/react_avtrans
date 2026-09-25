import { z } from 'zod'

const channel = z.enum(['SITE', 'EMAIL', 'NONE'])

/** Préférences de notification : un canal parmi les trois options pour chacune des six clés. */
export const notificationPreferencesSchema = z.object({
  acompte: channel,
  absence: channel,
  userCreated: channel,
  rapportVehicule: channel,
  todo: channel,
  serviceModification: channel,
})

export type NotificationPreferencesFormValues = z.infer<typeof notificationPreferencesSchema>
