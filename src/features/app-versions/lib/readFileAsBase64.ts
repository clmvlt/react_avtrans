/**
 * Lit un fichier en base64 brut (sans le préfixe `data:…;base64,`) en signalant la progression
 * de 0 à 100, comme la lecture de l'APK du Vue (`FileReader.readAsDataURL` + `onprogress`).
 * `src/lib/fileToDataUrl` ne donne pas la progression, d'où cette variante.
 */
export function readFileAsBase64(
  file: Blob,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve(result.split(',')[1] || '')
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))

    reader.readAsDataURL(file)
  })
}
