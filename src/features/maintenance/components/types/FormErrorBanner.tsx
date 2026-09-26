type FormErrorBannerProps = {
  message: string
}

/**
 * Bandeau d'erreur des dialogs de TypesEntretien.vue (type et dossier), affiché entre le titre et
 * les champs quand l'enregistrement échoue.
 */
export function FormErrorBanner({ message }: FormErrorBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive"
    >
      {message}
    </div>
  )
}
