import { apiClient } from "@/lib/apiClient";
import { Notification, WebhookSubscription } from "@/types";

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get<Notification[]>("/notifications");
  },

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.put<Notification>("/notifications", { _id: id });
  },

  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete<void>(`/notifications?id=${id}`);
  },

  async getWebhooksAdmin(): Promise<WebhookSubscription[]> {
    return apiClient.get<WebhookSubscription[]>("/admin/webhooks");
  },

  async addWebhookAdmin(data: { url: string; event: "order.created" | "order.status_updated" | "customer.created" }): Promise<WebhookSubscription> {
    return apiClient.post<WebhookSubscription>("/admin/webhooks", data);
  },

  async toggleWebhookAdmin(id: string, isActive: boolean): Promise<WebhookSubscription> {
    return apiClient.put<WebhookSubscription>("/admin/webhooks", { _id: id, isActive });
  },

  async deleteWebhookAdmin(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/webhooks?id=${id}`);
  }
};
