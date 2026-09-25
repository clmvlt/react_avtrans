import type { UserDTO } from './UserDTO'

/**
 * DTO pour une catégorie de todo
 */
export interface TodoCategoryDTO {
  uuid?: string
  name?: string
  color?: string
  createdAt?: string | Date
}

/**
 * DTO pour un todo
 */
export interface TodoDTO {
  uuid?: string
  title?: string
  description?: string
  category?: TodoCategoryDTO
  isDone?: boolean
  completedAt?: string | Date
  completedBy?: UserDTO
  createdBy?: UserDTO
  createdAt?: string | Date
  updatedAt?: string | Date
}

/**
 * Request pour créer une catégorie
 */
export interface CreateTodoCategoryRequest {
  name: string
  color: string
}

/**
 * Request pour mettre à jour une catégorie — PUT /todo-categories/{uuid}
 * `name` est obligatoire (remplacé) ; `color` absent/null = inchangée
 */
export interface UpdateTodoCategoryRequest {
  name: string
  color?: string
}

/**
 * Request pour créer un todo
 */
export interface CreateTodoRequest {
  title: string
  description?: string
  categoryUuid?: string
}

/**
 * Request pour mettre à jour un todo — PUT /todos/{uuid}
 * Tous les champs optionnels (null = inchangé). Impossible de retirer la catégorie.
 */
export interface UpdateTodoRequest {
  title?: string
  description?: string
  categoryUuid?: string
}

/**
 * Paramètres de recherche pour les todos
 */
export interface TodoSearchParams {
  categoryUuid?: string
  isDone?: boolean
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: string
}

/**
 * Réponse de l'API pour la liste des catégories
 */
export interface TodoCategoriesResponse {
  success: boolean
  categories: TodoCategoryDTO[]
}

/**
 * Réponse de l'API pour une catégorie unique
 */
export interface TodoCategoryResponse {
  success: boolean
  message?: string
  category: TodoCategoryDTO
}

/**
 * Réponse de l'API pour la recherche de todos
 */
export interface TodoSearchResponse {
  success: boolean
  todos: TodoDTO[]
  totalPages: number
  totalElements: number
  currentPage: number
}

/**
 * Réponse de l'API pour un todo unique
 */
export interface TodoResponse {
  success: boolean
  message?: string
  todo: TodoDTO
}
