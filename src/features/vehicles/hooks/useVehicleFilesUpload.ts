import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { fileToDataUrl } from '@/lib/fileToDataUrl'
import { vehiclesService } from '@/services'
import { vehiclesKeys } from '../api/queryKeys'
import { getErrorMessage } from '../lib/errors'

/** Taille maximale annoncée pour un fichier de véhicule. */
const MAX_FILE_SIZE = 500 * 1024 * 1024

type UploadProgress = {
  /** De 0 à 100, par fichier (i / n) et non par octet. */
  progress: number
  currentFile: string
  totalFiles: number
  currentIndex: number
}

const IDLE: UploadProgress = { progress: 0, currentFile: '', totalFiles: 0, currentIndex: 0 }

/**
 * Envoi des fichiers d'un véhicule, repris d'`uploadFilesToServer` (VehiculeDetail.vue:1125) :
 * - séquentiel, un POST JSON par fichier avec la data-URL complète (pas de multipart) : le timeout
 *   de 30 s du client rend les gros fichiers quasi impossibles à envoyer (MIGRATION.md 8.3) ;
 * - un fichier de plus de 500 Mo est signalé puis ignoré, les suivants partent ;
 * - une erreur d'envoi interrompt le lot et la liste n'est pas rechargée (comportement du Vue) ;
 * - le message d'erreur reste affiché jusqu'au prochain envoi.
 *
 * Monté au niveau des onglets du détail : l'envoi et sa progression survivent à un changement
 * d'onglet, comme dans le Vue où l'état vivait dans la page.
 */
export function useVehicleFilesUpload(vehiculeId: string) {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<UploadProgress>(IDLE)
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async (files: File[]) => {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file) continue

        setProgress((current) => ({
          ...current,
          currentIndex: i + 1,
          currentFile: file.name,
          progress: Math.round((i / files.length) * 100),
        }))

        if (file.size > MAX_FILE_SIZE) {
          setError(`Le fichier "${file.name}" est trop volumineux (max 500MB)`)
          continue
        }

        const fileB64 = await fileToDataUrl(file)
        await vehiclesService.addFile(vehiculeId, {
          fileB64,
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
        })
      }
      setProgress((current) => ({ ...current, progress: 100 }))
    },
    // Rechargé seulement si tout le lot est passé (le Vue sautait `loadFiles()` en cas d'erreur)
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclesKeys.files(vehiculeId) }),
  })

  const upload = (files: File[]) => {
    if (mutation.isPending) return
    setError('')
    setProgress({ ...IDLE, totalFiles: files.length })
    mutation.mutate(files, {
      onError: (err) => setError(getErrorMessage(err, "Erreur lors de l'upload du fichier")),
      onSettled: () => setProgress((current) => ({ ...current, progress: 0, currentFile: '' })),
    })
  }

  return {
    upload,
    uploading: mutation.isPending,
    error,
    ...progress,
  }
}

export type VehicleFilesUpload = ReturnType<typeof useVehicleFilesUpload>
