import { apiClient, isMockMode } from "@/lib/apiClient";
import { Notification } from "@/types";

const NOTIFICATIONS_STORAGE_KEY = "flexsell-notifications-storage";

function getLocalNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [
      {
        _id: "notif-welcome",
        customerId: "active-user",
        title: "Welcome to FlexSell Wholesale",
        message: "Your wholesale B2B buyer account is active. Explore tiered volume pricing and catalog specs.",
        type: "info",
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ];
  } catch (err) {
    console.error("Failed to read notifications from localStorage", err);
    return [];
  }
}

function saveLocalNotifications(notifications: Notification[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.error("Failed to save notifications to localStorage", err);
  }
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    if (isMockMode) {
      return getLocalNotifications();
    }
    return apiClient.get<Notification[]>("/notifications");
  },

  async markAsRead(id: string): Promise<Notification> {
    if (isMockMode) {
      const notifications = getLocalNotifications();
      let updatedNotif: Notification | null = null;
      const updatedList = notifications.map(n => {
        if (n._id === id) {
          updatedNotif = { ...n, isRead: true };
          return updatedNotif;
        }
        return n;
      });
      saveLocalNotifications(updatedList);
      if (!updatedNotif) throw new Error("Notification not found");
      return updatedNotif;
    }
    return apiClient.put<Notification>("/notifications", { _id: id });
  },

  async deleteNotification(id: string): Promise<void> {
    if (isMockMode) {
      const notifications = getLocalNotifications();
      saveLocalNotifications(notifications.filter(n => n._id !== id));
      return;
    }
    return apiClient.delete<void>(`/notifications?id=${id}`);
  }
};
