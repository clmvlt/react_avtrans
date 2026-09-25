import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AcompteDTO } from '@/models'
import { getAcompteMenuEntries, type AcompteActionHandler } from './acompteRowActions'

type AcompteActionsDropdownProps = {
  acompte: AcompteDTO
  onAction: AcompteActionHandler
  /** Bascule de paiement de cet acompte en cours : entrée désactivée. */
  paymentPending?: boolean
}

/** Menu « ⋮ » d'une carte d'acompte (liste mobile). */
export function AcompteActionsDropdown({
  acompte,
  onAction,
  paymentPending = false,
}: AcompteActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {getAcompteMenuEntries(acompte, 'dropdown').map((entry) =>
          entry.kind === 'separator' ? (
            <DropdownMenuSeparator key={entry.key} />
          ) : (
            <DropdownMenuItem
              key={entry.action}
              variant={entry.tone === 'destructive' ? 'destructive' : 'default'}
              className={entry.tone === 'success' ? 'text-green-600' : undefined}
              disabled={entry.action === 'togglePayment' && paymentPending}
              onSelect={() => onAction(entry.action, acompte)}
            >
              <entry.icon className="mr-2 size-4 text-current" />
              {entry.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
