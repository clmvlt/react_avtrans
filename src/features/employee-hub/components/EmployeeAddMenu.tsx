import { BedDouble, CalendarX2, ChevronDown, Coins, Plus, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type EmployeeAddMenuProps = {
  /** Propose « Une couchette » (employé avec la permission couchette) */
  canAddCouchette: boolean
  onAddService: () => void
  onAddAbsence: () => void
  onAddAcompte: () => void
  onAddCouchette: () => void
}

/** Action principale de la fiche : ajouter pour l'employé un pointage, une absence, un acompte… */
export function EmployeeAddMenu({
  canAddCouchette,
  onAddService,
  onAddAbsence,
  onAddAcompte,
  onAddCouchette,
}: EmployeeAddMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Ajouter
          <ChevronDown className="size-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Pour cet employé
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onAddService}>
          <Timer className="mr-2 size-4" />
          Un pointage
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onAddAbsence}>
          <CalendarX2 className="mr-2 size-4" />
          Une absence
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onAddAcompte}>
          <Coins className="mr-2 size-4" />
          Un acompte
        </DropdownMenuItem>
        {canAddCouchette && (
          <DropdownMenuItem onSelect={onAddCouchette}>
            <BedDouble className="mr-2 size-4" />
            Une couchette
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
