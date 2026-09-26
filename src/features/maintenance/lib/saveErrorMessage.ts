/**
 * Erreur d'enregistrement des dialogs de TypesEntretien.vue : message de l'API, sinon le texte
 * générique du Vue.
 */
export const saveErrorMessage = (error: unknown) =>
  (error instanceof Error && error.message) || "Erreur lors de l'enregistrement"
