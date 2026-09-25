import { useMutation } from '@tanstack/react-query'
import { downloadBlob } from '@/lib/downloadBlob'
import { exportService, type ExportHoursRequest } from '@/services'

/**
 * Export Excel des heures (POST /export/hours). Le service, copié tel quel, fait un `fetch` direct
 * (hors ApiClient : pas de timeout, 401 non intercepté, message d'erreur brut), comme le Vue.
 * Le fichier `heures_{début}_{fin}.xlsx` est téléchargé dès la réponse reçue.
 */
export function useExportHoursMutation() {
  return useMutation({
    mutationFn: (request: ExportHoursRequest) => exportService.exportHours(request),
    onSuccess: (blob, request) => {
      downloadBlob(blob, `heures_${request.startDate}_${request.endDate}.xlsx`)
    },
  })
}
