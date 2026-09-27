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

/** Menu « ⋮ » d'un acompte (carte mobile et colonne Actions du tableau). */
export function AcompteActionsDropdown({
  acompte,
  onAction,
  paymentPending = false,
}: AcompteActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Actions">
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
              className={entry.tone === 'success' ? 'text-success focus:text-success' : undefined}
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
