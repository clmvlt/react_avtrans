/**
 * Request DTO for exporting hours
 */
export interface ExportHoursRequest {
  userUuids: string[]
  startDate: string
  endDate: string
}

/**
 * Export service for generating Excel reports
 * Handles export operations for hours data
 */
export class ExportService {
  /**
   * Export worked hours to Excel file
   * @param request - Export parameters (userUuids, startDate, endDate)
   * @returns Promise with Blob containing the Excel file
   */
  async exportHours(request: ExportHoursRequest): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://192.168.1.120:8081/'}export/hours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Erreur lors de l\'export')
    }

    return response.blob()
  }
}

/**
 * Singleton instance of ExportService
 */
export const exportService = new ExportService()
