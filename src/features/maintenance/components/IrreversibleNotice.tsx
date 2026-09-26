import { CircleAlert, TriangleAlert } from 'lucide-react'

type IrreversibleNoticeProps = {
  /** Question posée (« Êtes-vous sûr de vouloir supprimer cet entretien ? »). */
  message: string
  /**
   * - `inline` (Entretiens.vue) : question grisée puis avertissement rouge avec un triangle ;
   * - `centered` (EntretiensVehicule.vue) : texte centré, avertissement avec un cercle.
   */
  variant: 'inline' | 'centered'
}

/** Corps des confirmations de suppression des pages d'entretiens (« Cette action est irréversible. »). */
export function IrreversibleNotice({ message, variant }: IrreversibleNoticeProps) {
  if (variant === 'inline') {
    return (
      <>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="flex items-center gap-2 text-sm text-destructive">
          <TriangleAlert className="size-4" />
          Cette action est irréversible.
        </p>
      </>
    )
  }

  return (
    <div className="text-center">
      <p className="mb-3 text-foreground">{message}</p>
      <p className="flex items-center justify-center gap-2 font-medium text-destructive">
        <CircleAlert className="size-4" />
        Cette action est irréversible.
      </p>
    </div>
  )
}
