import { toast } from 'sonner'

/**
 * Équivalents de `useMessages().success / error(texte, titre?)` du Vue : titre en gras et texte
 * en description quand un titre est donné ; durées du Vue (succès 5 s, erreur 7 s).
 */
export function notifySuccess(text: string, title?: string) {
  toast.success(title ?? text, { description: title ? text : undefined, duration: 5000 })
}

export function notifyError(text: string, title?: string) {
  toast.error(title ?? text, { description: title ? text : undefined, duration: 7000 })
}
