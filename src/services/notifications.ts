import { apiClient } from '@/api'
import type { NotificationDTO } from '@/models'
import type { SuccessMessageResponse, ApiResponse } from '@/types'

/**
 * Notification create request
 */
export interface NotificationCreateRequest {
  title: string
  message: string
  recipientUuid?: string
  roleName?: string
  refType?: string
  refId?: string
}

/**
 * Notification unread count response
 */
export interface UnreadCountResponse {
  success: boolean
  message?: string
  count: number
}

/**
 * Notifications service
 * Handles notification management, read status, and admin notifications
 */
export class NotificationsService {
  /**
   * Get all notifications
   * @returns Promise with list of notifications
   */
  async getNotifications(): Promise<ApiResponse<NotificationDTO[]>> {
    return apiClient.get<ApiResponse<NotificationDTO[]>>('notifications')
  }

  /**
   * Get notification by UUID
   * @param uuid - Notification UUID
   * @returns Promise with notification details
   */
  async getNotificationById(uuid: string): Promise<ApiResponse<NotificationDTO>> {
    return apiClient.get<ApiResponse<NotificationDTO>>(`notifications/${uuid}`)
  }

  /**
   * Get unread notifications
   * @returns Promise with list of unread notifications
   */
  async getUnreadNotifications(): Promise<ApiResponse<NotificationDTO[]>> {
    return apiClient.get<ApiResponse<NotificationDTO[]>>('notifications/unread')
  }

  /**
   * Get read notifications
   * @returns Promise with list of read notifications
   */
  async getReadNotifications(): Promise<ApiResponse<NotificationDTO[]>> {
    return apiClient.get<ApiResponse<NotificationDTO[]>>('notifications/read')
  }

  /**
   * Get unread notifications count
   * @returns Promise with unread count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiClient.get<UnreadCountResponse>('notifications/unread/count')
  }

  /**
   * Mark notification as read
   * @param uuid - Notification UUID
   * @returns Promise with updated notification
   */
  async markAsRead(uuid: string): Promise<ApiResponse<NotificationDTO>> {
    return apiClient.patch<ApiResponse<NotificationDTO>>(`notifications/${uuid}/read`)
  }

  /**
   * Mark all notifications as read
   * @returns Promise with success message
   */
  async markAllAsRead(): Promise<SuccessMessageResponse> {
    return apiClient.patch<SuccessMessageResponse>('notifications/read-all')
  }

  /**
   * [ADMIN] Send notification to all users of a role
   * @param roleName - Role name
   * @param notificationData - Notification data
   * @returns Promise with success message
   */
  async sendNotificationToRole(roleName: string, notificationData: NotificationCreateRequest): Promise<SuccessMessageResponse> {
    return apiClient.post<SuccessMessageResponse>(`notifications/send-to-role/${roleName}`, notificationData)
  }
}

/**
 * Singleton instance of NotificationsService
 */
export const notificationsService = new NotificationsService()
