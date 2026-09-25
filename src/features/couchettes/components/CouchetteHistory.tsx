import { BedDouble } from 'lucide-react'
import { SimplePagination } from '@/components/shared/SimplePagination'
import { Skeleton } from '@/components/ui/skeleton'
import type { CouchetteDTO } from '@/models'
import { formatNights, type CouchetteMonthGroup } from '../lib/couchetteDates'
import { CouchetteHistoryItem } from './CouchetteHistoryItem'

type CouchetteHistoryProps = {
  groups: CouchetteMonthGroup[]
  /** Aucune couchette sur la page chargée. */
  isEmpty: boolean
  totalElements: number
  /** Chargement en cours (page suivante, rechargement après une action) : squelette. */
  loading: boolean
  todayKey: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onDelete: (couchette: CouchetteDTO) => void
}

/** Colonne « Historique » de /mycouchettes : nuits groupées par mois, pagination en carte. */
export function CouchetteHistory({
  groups,
  isEmpty,
  totalElements,
  loading,
  todayKey,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
}: CouchetteHistoryProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Historique</h2>
        <span className="text-xs text-muted-foreground">{formatNights(totalElements)}</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <BedDouble className="mx-auto mb-3 size-9 text-muted-foreground/70" />
          <p className="text-sm text-muted-foreground">Aucune couchette déclarée pour l'instant</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-foreground capitalize">{group.label}</h3>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatNights(group.items.length)}
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {group.items.map((couchette, index) => (
                  <CouchetteHistoryItem
                    key={couchette.uuid ?? index}
                    couchette={couchette}
                    isToday={!!couchette.date && couchette.date === todayKey}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <SimplePagination
          variant="card"
          page={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </section>
  )
}
