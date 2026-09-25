import { z } from 'zod'
import { emailField } from './fields'

/** Connexion : les deux champs sont requis (astérisques du Vue), e-mail au format natif. */
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Veuillez entrer votre mot de passe'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
