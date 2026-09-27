import { getDayColumnMinWidth, getPlanningDensity, type PlanningDensity } from './planningDates'

export type PlanningLayout = {
  density: PlanningDensity
  /** `grid-template-columns` commun à toutes les lignes : noms, jours, total. */
  template: string
  /** Largeur minimale de la grille : au-delà, défilement horizontal. */
  minWidth: string
  /**
   * Largeur minimale d'une colonne de jour (`--planning-day-min`) : en vue semaine, étroite sur
   * téléphone pour que les 7 jours tiennent sans défilement.
   */
  dayMinClass: string
  /** Hauteur d'une ligne d'employé. */
  rowClass: string
}

/**
 * Classes écrites en toutes lettres (Tailwind ne voit pas les classes construites à l'exécution),
 * indexées par la largeur minimale de `getDayColumnMinWidth`.
 */
const DAY_MIN_CLASS: Record<number, string> = {
  56: '[--planning-day-min:22px] sm:[--planning-day-min:56px]',
  28: '[--planning-day-min:28px]',
  24: '[--planning-day-min:24px]',
  20: '[--planning-day-min:20px]',
}

const ROW_CLASS: Record<PlanningDensity, string> = {
  week: 'h-11',
  month: 'h-9',
  dense: 'h-7',
}

/**
 * Colonnes de la grille. Les largeurs des colonnes Employé et Total et le minimum d'une colonne
 * de jour sont des variables CSS (`--planning-name-col`, `--planning-total-col`,
 * `--planning-day-min`) posées par la grille selon la taille d'écran ; les jours se partagent le
 * reste (`1fr`).
 */
export function getPlanningLayout(dayCount: number): PlanningLayout {
  const density = getPlanningDensity(dayCount)
  const min = getDayColumnMinWidth(dayCount)
  return {
    density,
    template: `var(--planning-name-col) repeat(${dayCount}, minmax(var(--planning-day-min), 1fr)) var(--planning-total-col)`,
    minWidth: `calc(var(--planning-name-col) + var(--planning-total-col) + ${dayCount} * var(--planning-day-min))`,
    dayMinClass: DAY_MIN_CLASS[min] ?? '[--planning-day-min:28px]',
    rowClass: ROW_CLASS[density],
  }
}
