/** Formats d'heures de la fiche employé. */

const pad2 = (value: number) => String(value).padStart(2, '0')

/** « 7h30 », « 45min » ; chaîne vide sans temps de travail. */
export function formatDayHours(seconds: number): string {
  const totalMinutes = Math.floor(seconds / 60)
  if (totalMinutes <= 0) return ''
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}min`
  return minutes ? `${hours}h${pad2(minutes)}` : `${hours}h`
}

/** Compteur « 03:12:45 » (heures, minutes, secondes). */
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  return `${pad2(Math.floor(total / 3600))}:${pad2(Math.floor((total % 3600) / 60))}:${pad2(total % 60)}`
}
