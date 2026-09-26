import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import type { TodoDTO } from '@/models'
import { useDeleteTodoMutation } from '../api/useDeleteTodoMutation'

type TodoDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo: TodoDTO | null
}

/**
 * Confirmation de suppression d'une tâche. Comme le Vue, ni message de succès ni d'échec : en
 * cas d'erreur, le dialog reste simplement ouvert (B-31, reproduit).
 */
export function TodoDeleteDialog({ open, onOpenChange, todo }: TodoDeleteDialogProps) {
  const deleteMutation = useDeleteTodoMutation()

  const handleConfirm = () => {
    if (!todo?.uuid) return
    deleteMutation.mutate(todo.uuid, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Supprimer la tâche"
      description="Confirmer la suppression de la tâche"
      hideDescription
      isPending={deleteMutation.isPending}
      onConfirm={handleConfirm}
    >
      <p className="text-center text-muted-foreground">
        Voulez-vous vraiment supprimer la tâche{' '}
        <strong className="text-foreground">{todo?.title}</strong> ?
      </p>
    </ConfirmDialog>
  )
}
