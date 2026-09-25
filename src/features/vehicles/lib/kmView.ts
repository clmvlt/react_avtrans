/** Page affichée de l'historique km, ou tout l'historique après « Voir tout ». */
export type KmView = {
  page: number
  showAll: boolean
}

/** Vue par défaut, rétablie après un ajout ou une modification de relevé (comme `loadKilometrages()`). */
export const INITIAL_KM_VIEW: KmView = { page: 0, showAll: false }
