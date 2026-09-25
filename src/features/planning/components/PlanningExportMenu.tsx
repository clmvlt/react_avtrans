import { ChevronDown, FileText, ImageIcon, LoaderCircle, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { PlanningExportFormat } from '../lib/exportPlanningFile'

type PlanningExportMenuProps = {
  isExporting: boolean
  /** Période suivante en cours de chargement : l'export porterait sur l'ancienne. */
  disabled?: boolean
  onExport: (format: PlanningExportFormat) => void
}

/** Bouton « Exporter » : PDF (A4 paysage) ou image PNG. */
export function PlanningExportMenu({ isExporting, disabled, onExport }: PlanningExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={isExporting || disabled}>
          {isExporting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Printer className="size-4" />
          )}
          Exporter
          <ChevronDown className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Format d&apos;export</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onExport('pdf')}>
          <FileText className="size-4" />
          PDF (A4 paysage)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onExport('png')}>
          <ImageIcon className="size-4" />
          Image PNG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
