import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AbsenceDTO } from '@/models'
import { getAbsenceMenuEntries, type AbsenceActionHandler } from './absenceRowActions'

type AbsenceActionsDropdownProps = {
  absence: AbsenceDTO
  onAction: AbsenceActionHandler
}

/** Menu « ⋮ » d'une absence (carte mobile et colonne Actions du tableau). */
export function AbsenceActionsDropdown({ absence, onAction }: AbsenceActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Actions">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {getAbsenceMenuEntries(absence).map((entry) =>
          entry.kind === 'separator' ? (
            <DropdownMenuSeparator key={entry.key} />
          ) : (
            <DropdownMenuItem
              key={entry.action}
              variant={entry.tone === 'destructive' ? 'destructive' : 'default'}
              className={entry.tone === 'success' ? 'text-success focus:text-success' : undefined}
              onSelect={() => onAction(entry.action, absence)}
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
