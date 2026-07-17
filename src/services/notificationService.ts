import { apiClient, isMockMode, delay } from "@/lib/apiClient";
import { Notification, WebhookSubscription } from "@/types";

const NOTIFS_STORAGE_KEY = "flexsell-notifications-storage";
const WEBHOOKS_STORAGE_KEY = "flexsell-webhooks-storage";

function getMockNotifications(): Notification[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(NOTIFS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Notification[];
    } catch (e) {
      console.error("Error parsing mock notifications", e);
    }
  }
  const defaultMock: Notification[] = [
    {
      _id: "notif_1",
      customerId: "60c72b2f9b1d8e001c8e2001",
      title: "Welcome to FlexSell Wholesale!",
      message: "Your B2B account has been verified successfully. Start exploring bulk discounts in the catalog.",
      type: "info",
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];
  saveMockNotifications(defaultMock);
  return defaultMock;
}

function saveMockNotifications(notifs: Notification[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
}

function getMockWebhooks(): WebhookSubscription[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(WEBHOOKS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as WebhookSubscription[];
    } catch (e) {
      console.error("Error parsing mock webhooks", e);
    }
  }
  const defaultMock: WebhookSubscription[] = [
    {
      _id: "wh_1",
      url: "https://api.mycrm.com/v1/orders",
      event: "order.created",
      secret: "whsec_mocksecretkey1234567890abcdef",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
  saveMockWebhooks(defaultMock);
  return defaultMock;
}

function saveMockWebhooks(webhooks: WebhookSubscription[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(webhooks));
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    if (isMockMode) {
      await delay();
      return getMockNotifications();
    }
    return apiClient.get<Notification[]>("/notifications");
  },

  async markAsRead(id: string): Promise<Notification> {
    if (isMockMode) {
      await delay();
      const list = getMockNotifications();
      let updated: Notification | null = null;
      const updatedList = list.map(n => {
        if (n._id === id) {
          updated = { ...n, isRead: true };
          return updated;
        }
        return n;
      });
      if (!updated) {
        throw new Error("Notification not found");
      }
      saveMockNotifications(updatedList);
      return updated;
    }
    return apiClient.put<Notification>("/notifications", { _id: id });
  },

  async deleteNotification(id: string): Promise<void> {
    if (isMockMode) {
      await delay();
      const list = getMockNotifications();
      const filtered = list.filter(n => n._id !== id);
      saveMockNotifications(filtered);
      return;
    }
    return apiClient.delete<void>(`/notifications?id=${id}`);
  },

  async getWebhooksAdmin(): Promise<WebhookSubscription[]> {
    if (isMockMode) {
      await delay();
      return getMockWebhooks();
    }
    return apiClient.get<WebhookSubscription[]>("/admin/webhooks");
  },

  async addWebhookAdmin(data: { url: string; event: "order.created" | "order.status_updated" | "customer.created" }): Promise<WebhookSubscription> {
    if (isMockMode) {
      await delay();
      const list = getMockWebhooks();
      const newWebhook: WebhookSubscription = {
        _id: "wh_" + Math.random().toString(36).substring(2, 9),
        url: data.url,
        event: data.event,
        secret: "whsec_" + Math.random().toString(16).substring(2, 18),
        isActive: true,
        createdAt: new Date().toISOString()
      };
      list.push(newWebhook);
      saveMockWebhooks(list);
      return newWebhook;
    }
    return apiClient.post<WebhookSubscription>("/admin/webhooks", data);
  },

  async toggleWebhookAdmin(id: string, isActive: boolean): Promise<WebhookSubscription> {
    if (isMockMode) {
      await delay();
      const list = getMockWebhooks();
      let updated: WebhookSubscription | null = null;
      const updatedList = list.map(w => {
        if (w._id === id) {
          updated = { ...w, isActive };
          return updated;
        }
        return w;
      });
      if (!updated) {
        throw new Error("Webhook not found");
      }
      saveMockWebhooks(updatedList);
      return updated;
    }
    return apiClient.put<WebhookSubscription>("/admin/webhooks", { _id: id, isActive });
  },

  async deleteWebhookAdmin(id: string): Promise<void> {
    if (isMockMode) {
      await delay();
      const list = getMockWebhooks();
      const filtered = list.filter(w => w._id !== id);
      saveMockWebhooks(filtered);
      return;
    }
    return apiClient.delete<void>(`/admin/webhooks?id=${id}`);
  }
};
