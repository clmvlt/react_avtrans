import { BedDouble, LoaderCircle, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CouchetteDTO } from '@/models'
import { cn } from '@/lib/utils'
import { formatDeclaredAt } from '../lib/couchetteDates'

type TodayCouchetteCardProps = {
  /** « jeudi 25 septembre » */
  todayLabel: string
  /** Couchette du jour trouvée dans la page affichée (B-10), sinon `undefined`. */
  todayCouchette: CouchetteDTO | undefined
  creating: boolean
  deleting: boolean
  onCreate: () => void
  onCancelToday: (couchette: CouchetteDTO) => void
}

/** Carte d'état du jour de /mycouchettes : déclarer ou annuler sa couchette du jour. */
export function TodayCouchetteCard({
  todayLabel,
  todayCouchette,
  creating,
  deleting,
  onCreate,
  onCancelToday,
}: TodayCouchetteCardProps) {
  const declared = !!todayCouchette

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition-colors sm:p-6',
        declared ? 'border-success/30 bg-linear-to-br from-success/10 via-card to-card' : 'bg-card',
      )}
    >
      {/* Date et pastille d'état sur une ligne : le titre garde toute la largeur */}
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Aujourd'hui · <span className="capitalize">{todayLabel}</span>
        </p>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold',
            declared
              ? 'border-success/40 bg-success/10 text-success'
              : 'border-border bg-muted text-muted-foreground',
          )}
        >
          <BedDouble className="size-3.5" />
          {declared ? 'Déclarée' : 'Non déclarée'}
        </span>
      </div>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {declared ? 'Couchette déclarée' : 'Couchette du jour'}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {todayCouchette
          ? `Déclarée le ${formatDeclaredAt(todayCouchette.createdAt)}`
          : 'Vous dormez en couchette ce soir ? Déclarez-la en un appui.'}
      </p>

      <div className="mt-5">
        {todayCouchette ? (
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={deleting}
            onClick={() => onCancelToday(todayCouchette)}
          >
            {deleting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Annuler ma couchette du jour
          </Button>
        ) : (
          <Button
            type="button"
            className="h-14 w-full text-base font-semibold shadow-sm"
            disabled={creating}
            onClick={onCreate}
          >
            {creating ? (
              <LoaderCircle className="size-5 animate-spin" />
            ) : (
              <Plus className="size-5" />
            )}
            Déclarer ma couchette du jour
          </Button>
        )}
      </div>
    </section>
  )
}
