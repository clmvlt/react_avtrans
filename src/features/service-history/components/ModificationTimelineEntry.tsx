import { ArrowRight } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import type { ServiceModificationDTO } from '@/models'
import {
  buildServiceModificationView,
  getServiceModificationActionMeta,
} from '@/utils/serviceModificationFormatters'
import { formatParisDateTime } from '@/utils/timeFormatters'
import { ModificationUser } from './ModificationUser'

type ModificationTimelineEntryProps = {
  modification: ServiceModificationDTO
}

/**
 * Une action de la frise : pastille, titre, date, auteur, puis avant → après (UPDATE) ou
 * valeurs créées / supprimées (CREATE, DELETE).
 */
export function ModificationTimelineEntry({ modification }: ModificationTimelineEntryProps) {
  const meta = getServiceModificationActionMeta(modification.action)
  const view = buildServiceModificationView(modification)
  const isUpdate = modification.action !== 'CREATE' && modification.action !== 'DELETE'
  const isDelete = modification.action === 'DELETE'

  return (
    <li className="relative pb-6 last:pb-0">
      {/* Pastille de l'action */}
      <span
        className={cn(
          'absolute top-0 left-[calc(-2.25rem_-_0.5px)] flex size-6 items-center justify-center rounded-full border ring-4 ring-background',
          meta.classes,
        )}
      >
        <meta.icon className="size-3.5" />
      </span>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-semibold text-foreground">{meta.title}</span>
        <time dateTime={modification.createdAt} className="text-xs text-muted-foreground">
          {formatParisDateTime(modification.createdAt)}
        </time>
      </div>
      <div className="mt-1.5">
        <ModificationUser user={modification.modifiedBy} missingLabel="Administrateur supprimé" />
      </div>

      <div className="mt-3 rounded-md border bg-muted/30 p-3">
        {view.referenceDayLabel && (
          <p className="mb-2 text-xs text-muted-foreground">Pointage du {view.referenceDayLabel}</p>
        )}

        {isUpdate ? (
          <>
            {/* UPDATE : avant → après */}
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 text-sm">
              <span />
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Avant
              </span>
              <span />
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Après
              </span>
              {view.rows.map((row) => (
                <Fragment key={row.key}>
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span
                    className={cn(
                      'text-muted-foreground tabular-nums',
                      row.changed && 'line-through',
                    )}
                  >
                    {row.before}
                  </span>
                  <ArrowRight
                    className={cn(
                      'size-3.5',
                      row.changed ? 'text-sky-600 dark:text-sky-400' : 'text-muted-foreground/40',
                    )}
                  />
                  <span
                    className={cn(
                      'w-fit tabular-nums',
                      row.changed
                        ? 'rounded bg-sky-500/10 px-1.5 font-semibold text-sky-700 dark:text-sky-300'
                        : 'text-muted-foreground',
                    )}
                  >
                    {row.after}
                  </span>
                </Fragment>
              ))}
            </div>
            {view.changedRows.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground italic">
                Horaires et type inchangés.
              </p>
            )}
          </>
        ) : (
          <>
            {/* CREATE / DELETE : valeurs créées ou supprimées */}
            <p className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              {isDelete ? 'Valeurs supprimées' : 'Valeurs créées'}
            </p>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
              {view.rows.map((row) => (
                <Fragment key={row.key}>
                  <dt className="text-xs leading-5 text-muted-foreground">{row.label}</dt>
                  <dd className="text-foreground tabular-nums">
                    {isDelete ? row.before : row.after}
                  </dd>
                </Fragment>
              ))}
            </dl>
          </>
        )}
      </div>
    </li>
  )
}
