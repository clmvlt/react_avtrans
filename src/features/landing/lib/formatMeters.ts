/** Formate une dimension en mètres à la française (ex. « 6,30 m »). */
export const formatMeters = (meters: number) =>
  `${meters.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`
