import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ServiceModificationDTO } from '@/models'
import {
  buildServiceModificationView,
  type ServiceFieldKey,
  type ServiceFieldRow,
} from '@/utils/serviceModificationFormatters'

type ServiceModificationSummaryProps = {
  modification: ServiceModificationDTO
}

const EMPTY_ROW: ServiceFieldRow = {
  key: 'debut',
  label: '',
  before: '',
  after: '',
  changed: false,
}

const HIGHLIGHT = 'rounded bg-sky-500/10 px-1 font-semibold text-sky-700 dark:text-sky-300'

/**
 * Résumé compact « avant → après » d'une entrée du journal des pointages : jour et type du
 * pointage, puis horaires (champs modifiés barrés puis surlignés ; création ou suppression :
 * valeurs créées ou supprimées).
 */
export function ServiceModificationSummary({ modification }: ServiceModificationSummaryProps) {
  const view = buildServiceModificationView(modification)
  const isUpdate = modification.action !== 'CREATE' && modification.action !== 'DELETE'
  const isDelete = modification.action === 'DELETE'

  const row = (key: ServiceFieldKey) => view.rows.find((r) => r.key === key) ?? EMPTY_ROW
  const debut = row('debut')
  const fin = row('fin')
  const kind = row('isBreak')
  // CREATE : valeurs créées ; DELETE : valeurs supprimées
  const single = (r: ServiceFieldRow) => (isDelete ? r.before : r.after)

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        {view.referenceDate && (
          <>
            <span>{view.referenceDate}</span>
            <span aria-hidden="true">·</span>
          </>
        )}
        {isUpdate && kind.changed ? (
          <>
            <span className="line-through">{kind.before}</span>
            <ArrowRight className="size-3" />
            <span className={HIGHLIGHT}>{kind.after}</span>
          </>
        ) : (
          <span>{isUpdate ? kind.after : single(kind)}</span>
        )}
      </div>

      {isUpdate ? (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm tabular-nums">
          <span className="text-muted-foreground">
            <span className={cn(debut.changed && 'line-through')}>{debut.before}</span>
            {' – '}
            <span className={cn(fin.changed && 'line-through')}>{fin.before}</span>
          </span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-foreground">
            <span className={cn(debut.changed && HIGHLIGHT)}>{debut.after}</span>
            {' – '}
            <span className={cn(fin.changed && HIGHLIGHT)}>{fin.after}</span>
          </span>
          {view.changedRows.length === 0 && (
            <span className="text-xs text-muted-foreground italic">(inchangé)</span>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'text-sm tabular-nums',
            isDelete
              ? 'text-muted-foreground line-through decoration-destructive/60'
              : 'text-foreground',
          )}
        >
          {single(debut)} – {single(fin)}
        </div>
      )}
    </div>
  )
}
