import { Checkbox } from '@/components/ui/checkbox'

type TodosToolbarProps = {
  showCompleted: boolean
  onShowCompletedChange: (showCompleted: boolean) => void
}

/**
 * Filtre « Afficher les tâches terminées » au-dessus du tableau, et rappel du glisser-déposer
 * sur grand écran (les actions « Catégories » et « Nouvelle tâche » sont dans l'en-tête).
 */
export function TodosToolbar({ showCompleted, onShowCompletedChange }: TodosToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <label className="flex min-h-9 cursor-pointer items-center gap-2">
        <Checkbox
          checked={showCompleted}
          onCheckedChange={(checked) => onShowCompletedChange(checked === true)}
        />
        <span className="text-sm text-foreground">Afficher les tâches terminées</span>
      </label>
      <p className="text-xs text-muted-foreground max-md:hidden">
        Glissez une tâche vers une autre colonne pour changer sa catégorie, ou vers la corbeille
        pour la supprimer (sans confirmation).
      </p>
    </div>
  )
}
