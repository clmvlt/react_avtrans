type EntretiensTotalCostProps = {
  total: number
}

/**
 * Bandeau « Total coût HT » : somme des lignes **affichées** (page courante, après la recherche
 * rapide), comme le Vue (bug B-20 reproduit).
 */
export function EntretiensTotalCost({ total }: EntretiensTotalCostProps) {
  return (
    <div className="mb-2 flex justify-end gap-2 rounded-xl border bg-card px-4 py-3">
      <span className="text-sm font-medium text-muted-foreground">Total coût HT :</span>
      <span className="text-sm font-semibold text-foreground">
        {total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
      </span>
    </div>
  )
}
