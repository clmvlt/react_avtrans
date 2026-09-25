import { UserIdentity } from '@/components/shared/UserIdentity'
import type { CouchetteDTO } from '@/models'
import { formatCouchetteDate, formatCouchetteDateTime } from '../lib/couchetteDates'

type CouchetteUserSummaryProps = {
  couchette: CouchetteDTO
}

/** Bloc « Employé » + dates, commun aux dialogs de détail et de suppression (admin). */
export function CouchetteUserSummary({ couchette }: CouchetteUserSummaryProps) {
  return (
    <>
      <div className="border-b pb-4">
        <h4 className="mb-3 text-xs tracking-wider text-muted-foreground uppercase">Employé</h4>
        <UserIdentity user={couchette.user} size="xl" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs tracking-wider text-muted-foreground uppercase">
            Date de la couchette
          </span>
          <span className="font-medium text-primary">{formatCouchetteDate(couchette.date)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs tracking-wider text-muted-foreground uppercase">Créée le</span>
          <span className="font-medium text-foreground">
            {formatCouchetteDateTime(couchette.createdAt)}
          </span>
        </div>
      </div>
    </>
  )
}
