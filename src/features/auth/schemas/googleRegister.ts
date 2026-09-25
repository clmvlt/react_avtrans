import { z } from 'zod'

/** Création de compte Google (GoogleRegister.vue) : prénom et nom requis, envoyés sans espaces. */
export const googleRegisterSchema = z.object({
  firstName: z.string().trim().min(1, 'Veuillez entrer votre prénom'),
  lastName: z.string().trim().min(1, 'Veuillez entrer votre nom'),
})

export type GoogleRegisterFormInput = z.input<typeof googleRegisterSchema>
export type GoogleRegisterFormValues = z.output<typeof googleRegisterSchema>
