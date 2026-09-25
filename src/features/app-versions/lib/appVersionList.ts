import type { AppVersionDTO } from '@/models'

/** Tri du Vue : `versionCode` décroissant (la plus récente en premier). Renvoie une copie. */
export function sortByVersionCodeDesc(versions: AppVersionDTO[]): AppVersionDTO[] {
  return [...versions].sort((a, b) => b.versionCode - a.versionCode)
}

/**
 * Recherche de la page admin : sous-chaîne du nom de version, du nom de fichier ou des notes,
 * insensible à la casse. Comme le Vue, le texte n'est pas rogné (seule une saisie vide ou faite
 * d'espaces affiche tout).
 */
export function filterAppVersions(versions: AppVersionDTO[], search: string): AppVersionDTO[] {
  if (!search.trim()) return versions

  const query = search.toLowerCase()
  return versions.filter(
    (version) =>
      version.versionName.toLowerCase().includes(query) ||
      version.originalFileName.toLowerCase().includes(query) ||
      (version.changelog || '').toLowerCase().includes(query),
  )
}

export type ActiveAppVersions = {
  /** Plus grand `versionCode` (calculé côté client, comme le Vue) */
  latest: AppVersionDTO | null
  /** Les autres, du plus récent au plus ancien */
  older: AppVersionDTO[]
}

/**
 * Sépare la dernière version des précédentes (page /download). Le bouton principal télécharge
 * pourtant `latest/download`, choisi par le serveur : les deux peuvent diverger, comme dans le Vue.
 */
export function splitLatestVersion(versions: AppVersionDTO[]): ActiveAppVersions {
  const sorted = sortByVersionCodeDesc(versions)
  const latest = sorted[0] ?? null
  return {
    latest,
    older: latest ? sorted.filter((version) => version.id !== latest.id) : [],
  }
}
