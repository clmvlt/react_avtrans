import { useState } from 'react'
import { toast } from 'sonner'
import type { AbsenceTypeDTO } from '@/models'
import type { PlanningUserDTO } from '@/services/absences'
import { exportPlanningFile, type PlanningExportFormat } from '../lib/exportPlanningFile'
import { buildExportHtml } from '../lib/planningExportHtml'
import { getExportPeriodLabel, type PlanningDate } from '../lib/planningDates'

type PlanningExportInput = {
  users: PlanningUserDTO[]
  dates: PlanningDate[]
  absenceTypes: AbsenceTypeDTO[]
  startDate: string
  endDate: string
}

/**
 * Export du planning affiché en PDF (A4 paysage) ou en PNG. Un échec passe par un toast : le Vue
 * remplaçait toute la grille par le message d'erreur (corrigé par construction, MIGRATION.md 8.1).
 */
export function usePlanningExport() {
  const [isExporting, setIsExporting] = useState(false)

  const exportPlanning = async (format: PlanningExportFormat, input: PlanningExportInput) => {
    if (!input.users.length || isExporting) return
    setIsExporting(true)

    try {
      const periodLabel = getExportPeriodLabel(input.startDate, input.endDate)
      const html = buildExportHtml({
        users: input.users,
        dates: input.dates,
        absenceTypes: input.absenceTypes,
        periodLabel,
      })
      await exportPlanningFile(format, {
        html,
        periodLabel,
        startDate: input.startDate,
        endDate: input.endDate,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error("Erreur lors de l'export. Veuillez réessayer.", { duration: 7000 })
    } finally {
      setIsExporting(false)
    }
  }

  return { isExporting, exportPlanning }
}
