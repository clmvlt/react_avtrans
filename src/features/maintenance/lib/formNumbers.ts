/**
 * Conversion des champs numériques des formulaires d'entretien (valeurs texte des inputs natifs),
 * différente selon la vue d'origine.
 */

/**
 * Entretiens.vue : `$event ? Number($event) : null`. Vue convertit la saisie d'un
 * `type="number"` en nombre : 0 devient `null` comme un champ vide (bug du Vue reproduit : un
 * coût à 0 est omis, un kilométrage mis à 0 en modification n'est pas envoyé).
 */
export const truthyNumberOrNull = (value: string): number | null => Number(value) || null

/** EntretiensVehicule.vue (`v-model.number`) : vide → `null`, sinon le nombre (0 conservé). */
export const numberOrNull = (value: string): number | null => (value === '' ? null : Number(value))
