import { z } from 'zod'

/** Nombre saisi avec une virgule ou un point (« 29,17 »), ou `null` s'il est invalide. */
export function parseHeures(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const number = Number(trimmed.replace(',', '.'))
  return Number.isFinite(number) ? number : null
}

/** Heures d'une absence fixées à la main (D8) : nombre positif ou nul, 1 000 h au plus. */
export const absenceHeuresSchema = z.object({
  heures: z
    .string()
    .trim()
    .min(1, "Indiquez un nombre d'heures")
    .refine((value) => {
      const number = parseHeures(value)
      return number !== null && number >= 0 && number <= 1000
    }, 'Nombre entre 0 et 1 000'),
})

export type AbsenceHeuresFormValues = z.input<typeof absenceHeuresSchema>
