import { formatDateTime } from '../lib/cartes'

type CarteSystemInfoProps = {
  uuid?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

/** Bloc « Informations système » (UUID, dates) des formulaires de carte et de type, en édition. */
export function CarteSystemInfo({ uuid, createdAt, updatedAt }: CarteSystemInfoProps) {
  return (
    <div className="rounded-md border bg-muted/50 p-4">
      <h4 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Informations système
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">UUID</span>
          <span className="font-mono text-xs break-all text-muted-foreground">{uuid}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Créé le</span>
          <span className="text-sm font-medium text-foreground">{formatDateTime(createdAt)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Modifié le</span>
          <span className="text-sm font-medium text-foreground">{formatDateTime(updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}
