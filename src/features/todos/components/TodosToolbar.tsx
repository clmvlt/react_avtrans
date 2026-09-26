import { Plus, Tags } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

type TodosToolbarProps = {
  showCompleted: boolean
  onShowCompletedChange: (showCompleted: boolean) => void
  onOpenCategories: () => void
  onCreate: () => void
}

/** En-tête collant du tableau : « Afficher terminées », « Catégories », « Nouvelle tâche ». */
export function TodosToolbar({
  showCompleted,
  onShowCompletedChange,
  onOpenCategories,
  onCreate,
}: TodosToolbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex flex-wrap items-center justify-end gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={showCompleted}
              onCheckedChange={(checked) => onShowCompletedChange(checked === true)}
            />
            <span className="text-sm whitespace-nowrap text-muted-foreground">
              Afficher terminées
            </span>
          </label>
          <Button type="button" variant="outline" size="sm" onClick={onOpenCategories}>
            <Tags className="size-4" />
            Catégories
          </Button>
          <Button type="button" size="sm" onClick={onCreate}>
            <Plus className="size-4" />
            Nouvelle tâche
          </Button>
        </div>
      </div>
    </header>
  )
}
