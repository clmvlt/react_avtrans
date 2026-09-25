import { Banknote } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import type { AcompteDTO } from '@/models'
import { getAcompteColumns } from './acompteColumns'
import { getAcompteMenuEntries, type AcompteActionHandler } from './acompteRowActions'

type AcomptesDataTableProps = {
  acomptes: AcompteDTO[]
  totalElements: number
  onAction: AcompteActionHandler
  /** Bascule de paiement en cours pour cet acompte : bouton et entrée désactivés. */
  isPaymentPending: (acompte: AcompteDTO) => boolean
}

/**
 * Table desktop (md+) des acomptes : colonnes triables, boutons d'action par ligne et menu
 * contextuel (clic droit) titré du nom de l'employé.
 */
export function AcomptesDataTable({
  acomptes,
  totalElements,
  onAction,
  isPaymentPending,
}: AcomptesDataTableProps) {
  return (
    <DataTable
      columns={getAcompteColumns(totalElements, onAction, isPaymentPending)}
      data={acomptes}
      getRowId={(acompte, index) => acompte.uuid ?? String(index)}
      emptyIcon={Banknote}
      emptyMessage="Aucun acompte trouvé"
      className="hidden md:block"
      renderRow={(row, rowElement) => {
        const acompte = row.original
        return (
          <ContextMenu>
            <ContextMenuTrigger asChild>{rowElement}</ContextMenuTrigger>
            <ContextMenuContent className="min-w-48">
              <ContextMenuLabel className="text-xs font-semibold text-muted-foreground">
                {`${acompte.user?.firstName ?? ''} ${acompte.user?.lastName ?? ''}`}
              </ContextMenuLabel>
              <ContextMenuSeparator />
              {getAcompteMenuEntries(acompte, 'context').map((entry) =>
                entry.kind === 'separator' ? (
                  <ContextMenuSeparator key={entry.key} />
                ) : (
                  <ContextMenuItem
                    key={entry.action}
                    variant={entry.tone === 'destructive' ? 'destructive' : 'default'}
                    className={entry.tone === 'success' ? 'text-green-600' : undefined}
                    disabled={entry.action === 'togglePayment' && isPaymentPending(acompte)}
                    onSelect={() => onAction(entry.action, acompte)}
                  >
                    <entry.icon className="size-4 text-current" />
                    {entry.label}
                  </ContextMenuItem>
                ),
              )}
            </ContextMenuContent>
          </ContextMenu>
        )
      }}
    />
  )
}
