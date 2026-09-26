import { useState, type DragEvent } from 'react'
import type { TodoCategoryDTO, TodoDTO } from '@/models'
import { useMoveTodoMutation } from '../api/useMoveTodoMutation'
import { useTrashTodoMutation } from '../api/useTrashTodoMutation'
import { NO_CATEGORY_TARGET, TRASH_TARGET } from '../lib/todos'

/**
 * Glisser-déposer HTML5 natif du tableau (Q-DND) : une tâche vers une colonne (changement de
 * catégorie) ou vers la corbeille flottante (suppression immédiate, sans confirmation : B-17).
 * `dragOverTarget` : uuid de la colonne survolée, `NO_CATEGORY_TARGET` ou `TRASH_TARGET`.
 * Inopérant au tactile, comme le Vue.
 */
export function useTodoDragAndDrop(categories: TodoCategoryDTO[]) {
  const [draggingTodo, setDraggingTodo] = useState<TodoDTO | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const moveMutation = useMoveTodoMutation()
  const trashMutation = useTrashTodoMutation()

  const handleDragStart = (event: DragEvent, todo: TodoDTO) => {
    setDraggingTodo(todo)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', todo.uuid || '')
  }

  const handleDragEnd = () => {
    setDraggingTodo(null)
    setDragOverTarget(null)
  }

  /** `target` : uuid de la colonne (`undefined` = « Sans catégorie ») ou `TRASH_TARGET`. */
  const handleDragOver = (event: DragEvent, target: string | undefined) => {
    event.preventDefault()
    setDragOverTarget(target || NO_CATEGORY_TARGET)
  }

  const handleDragLeave = () => setDragOverTarget(null)

  /** `target` : uuid de la colonne ou `NO_CATEGORY_TARGET`. */
  const handleDrop = (event: DragEvent, target: string | undefined) => {
    event.preventDefault()
    const todo = draggingTodo
    const todoUuid = todo?.uuid
    if (!todo || !todoUuid) return

    const targetCategoryUuid = target === NO_CATEGORY_TARGET ? undefined : target
    // Même catégorie : rien à faire
    if (targetCategoryUuid === todo.category?.uuid) {
      setDragOverTarget(null)
      return
    }

    moveMutation.mutate({
      todo: { ...todo, uuid: todoUuid },
      targetCategory: targetCategoryUuid
        ? categories.find((category) => category.uuid === targetCategoryUuid)
        : undefined,
      targetCategoryUuid,
    })
    setDragOverTarget(null)
  }

  const handleDropToTrash = (event: DragEvent) => {
    event.preventDefault()
    const todoUuid = draggingTodo?.uuid
    if (!todoUuid) return
    trashMutation.mutate(todoUuid)
    setDragOverTarget(null)
    setDraggingTodo(null)
  }

  return {
    draggingTodo,
    dragOverTarget,
    isOverTrash: dragOverTarget === TRASH_TARGET,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTrashDragOver: (event: DragEvent) => handleDragOver(event, TRASH_TARGET),
    handleDropToTrash,
  }
}
