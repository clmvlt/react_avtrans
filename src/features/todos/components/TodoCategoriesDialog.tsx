import { useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { Tags } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDialogState } from '@/hooks/useDialogState'
import type { TodoCategoryDTO } from '@/models'
import { todoCategoriesKeys } from '../api/queryKeys'
import { TodoCategoryDeleteDialog } from './TodoCategoryDeleteDialog'
import { TodoCategoryForm } from './TodoCategoryForm'
import { TodoCategoryList } from './TodoCategoryList'

type TodoCategoriesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * « Gestion des catégories » : formulaire en ligne (ajout / modification) et liste. La
 * confirmation de suppression est un dialog frère, comme le Vue.
 */
export function TodoCategoriesDialog({ open, onOpenChange }: TodoCategoriesDialogProps) {
  const [editingCategory, setEditingCategory] = useState<TodoCategoryDTO | null>(null)
  const deleteDialog = useDialogState<'delete', TodoCategoryDTO>()
  // Comme le `saving` partagé du Vue : boutons désactivés pendant un enregistrement ou une suppression
  const busy = useIsMutating({ mutationKey: todoCategoriesKeys.all }) > 0

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tags className="size-5" />
              Gestion des catégories
            </DialogTitle>
            <DialogDescription className="sr-only">
              Gérer les catégories de tâches
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <TodoCategoryForm
              key={editingCategory?.uuid ?? 'new'}
              editingCategory={editingCategory}
              busy={busy}
              onSaved={() => setEditingCategory(null)}
              onCancelEdit={() => setEditingCategory(null)}
            />
            <div className="min-h-[200px]">
              <TodoCategoryList
                editingUuid={editingCategory?.uuid}
                busy={busy}
                onEdit={setEditingCategory}
                onDelete={(category) => deleteDialog.open('delete', category)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TodoCategoryDeleteDialog
        open={deleteDialog.isOpen('delete')}
        onOpenChange={deleteDialog.onOpenChange}
        category={deleteDialog.item}
      />
    </>
  )
}
