import { toast } from 'sonner'

/** Durées des toasts du Vue (Messages.vue) : succès 5 s, erreur 7 s. */
const SUCCESS_DURATION_MS = 5000
const ERROR_DURATION_MS = 7000

/** `useMessages().success(texte, titre?)` du Vue : le titre en gras, le texte dessous. */
export function notifySuccess(text: string, title?: string) {
  toast.success(title ?? text, {
    description: title ? text : undefined,
    duration: SUCCESS_DURATION_MS,
  })
}

/** `useMessages().error(texte, titre?)` du Vue. */
export function notifyError(text: string, title?: string) {
  toast.error(title ?? text, {
    description: title ? text : undefined,
    duration: ERROR_DURATION_MS,
  })
}

/** Message d'une erreur inconnue (`err.message || repli` du Vue). */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}
