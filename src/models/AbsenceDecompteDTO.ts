/**
 * Décompte d'une absence (D8, MIGRATION.md) — POST /absences/decompte et /absences/admin/decompte
 */

/** Mode de décompte des jours d'un type d'absence */
export type ModeDecompte = 'JOURS_OUVRABLES' | 'JOURS_OUVRES' | 'JOURS_CALENDAIRES';

/**
 * Raison d'exclusion d'un jour (DIMANCHE, SAMEDI, FERIE) ou SAMEDI_REPRISE pour le samedi ajouté
 * (veille de la reprise, jours ouvrables) ; null si le jour est décompté normalement
 */
export type MotifJourDecompte = 'DIMANCHE' | 'SAMEDI' | 'FERIE' | 'SAMEDI_REPRISE';

export interface JourDecompteDTO {
  date: string;
  /** 0 (non décompté), 0.5 (demi-journée) ou 1 */
  fraction: number;
  /** Heures créditées ce jour (calcul automatique) */
  heures: number;
  motif: MotifJourDecompte | null;
  /** Nom du jour férié, le cas échéant */
  ferie: string | null;
}

export interface AbsenceDecompteDTO {
  modeDecompte: ModeDecompte;
  compteHeures: boolean;
  contratRenseigne: boolean;
  /** Heures mensuelles du contrat */
  heureContratMensuel: number | null;
  /** Heures hebdomadaires équivalentes (mensuel × 12 / 52) */
  heuresHebdo: number | null;
  /** Valeur d'un jour décompté */
  heuresParJour: number;
  joursDecomptes: number;
  heuresCalculees: number;
  heuresForcees: number | null;
  /** Heures retenues (forcées sinon calculées) */
  heures: number;
  /** Détail jour par jour, y compris les jours non décomptés et le samedi ajouté */
  jours: JourDecompteDTO[];
}
