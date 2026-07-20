import { apiClient } from "@/lib/apiClient";
import { Notification } from "@/types";

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>("/notifications");
  },

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.put<Notification>("/notifications", { _id: id });
  },

  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete<void>(`/notifications?id=${id}`);
  }
};
