import { apiClient } from '@/api'
import type {
  CreateTodoRequest,
  UpdateTodoRequest,
  CreateTodoCategoryRequest,
  UpdateTodoCategoryRequest,
  TodoSearchParams,
  TodoCategoriesResponse,
  TodoCategoryResponse,
  TodoSearchResponse,
  TodoResponse
} from '@/models'

/**
 * Todo management service
 * Handles todo and category CRUD operations
 */
export class TodosService {
  // ==================== Categories ====================

  /**
   * Get all todo categories
   * @returns Promise with categories list
   */
  async getCategories(): Promise<TodoCategoriesResponse> {
    return apiClient.get<TodoCategoriesResponse>('todo-categories')
  }

  /**
   * Get a category by UUID
   * @param uuid - Category UUID
   * @returns Promise with category details
   */
  async getCategoryByUuid(uuid: string): Promise<TodoCategoryResponse> {
    return apiClient.get<TodoCategoryResponse>(`todo-categories/${uuid}`)
  }

  /**
   * Create a new category
   * @param data - Category data
   * @returns Promise with created category
   */
  async createCategory(data: CreateTodoCategoryRequest): Promise<TodoCategoryResponse> {
    return apiClient.post<TodoCategoryResponse>('todo-categories', data)
  }

  /**
   * Update a category
   * @param uuid - Category UUID
   * @param data - Updated category data
   * @returns Promise with updated category
   */
  async updateCategory(uuid: string, data: UpdateTodoCategoryRequest): Promise<TodoCategoryResponse> {
    return apiClient.put<TodoCategoryResponse>(`todo-categories/${uuid}`, data)
  }

  /**
   * Delete a category
   * @param uuid - Category UUID
   * @returns Promise with deleted category
   */
  async deleteCategory(uuid: string): Promise<TodoCategoryResponse> {
    return apiClient.delete<TodoCategoryResponse>(`todo-categories/${uuid}`)
  }

  // ==================== Todos ====================

  /**
   * Search todos with filters
   * @param params - Search parameters
   * @returns Promise with paginated todos
   */
  async searchTodos(params?: TodoSearchParams): Promise<TodoSearchResponse> {
    return apiClient.post<TodoSearchResponse>('todos/search', params || {})
  }

  /**
   * Get a todo by UUID
   * @param uuid - Todo UUID
   * @returns Promise with todo details
   */
  async getTodoByUuid(uuid: string): Promise<TodoResponse> {
    return apiClient.get<TodoResponse>(`todos/${uuid}`)
  }

  /**
   * Create a new todo
   * @param data - Todo data
   * @returns Promise with created todo
   */
  async createTodo(data: CreateTodoRequest): Promise<TodoResponse> {
    return apiClient.post<TodoResponse>('todos', data)
  }

  /**
   * Update a todo
   * @param uuid - Todo UUID
   * @param data - Updated todo data
   * @returns Promise with updated todo
   */
  async updateTodo(uuid: string, data: UpdateTodoRequest): Promise<TodoResponse> {
    return apiClient.put<TodoResponse>(`todos/${uuid}`, data)
  }

  /**
   * Delete a todo
   * @param uuid - Todo UUID
   * @returns Promise with deleted todo
   */
  async deleteTodo(uuid: string): Promise<TodoResponse> {
    return apiClient.delete<TodoResponse>(`todos/${uuid}`)
  }

  /**
   * Toggle todo done status
   * @param uuid - Todo UUID
   * @returns Promise with updated todo
   */
  async toggleTodo(uuid: string): Promise<TodoResponse> {
    return apiClient.post<TodoResponse>(`todos/${uuid}/toggle`, {})
  }
}

/**
 * Singleton instance of TodosService
 */
export const todosService = new TodosService()
