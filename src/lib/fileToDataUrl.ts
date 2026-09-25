/**
 * Lit un fichier (ou un Blob) et renvoie sa data-URL complète (`data:<mime>;base64,<contenu>`).
 * Remplace les `new FileReader()` recopiés dans les vues du Vue (photos, fichiers de véhicule,
 * d'entretien, APK…). L'API reçoit les fichiers en base64 dans du JSON.
 */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible'))
    reader.readAsDataURL(file)
  })
}

/**
 * Comme `fileToDataUrl`, mais sans le préfixe `data:<mime>;base64,` (base64 brut), pour les
 * champs `fileB64` des services qui l'attendent ainsi.
 */
export async function fileToBase64(file: Blob): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  const comma = dataUrl.indexOf(',')
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
}
