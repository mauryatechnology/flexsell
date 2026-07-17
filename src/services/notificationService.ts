import { apiClient, isMockMode, delay } from "@/lib/apiClient";

const NOTIFS_STORAGE_KEY = "flexsell-notifications-storage";
const WEBHOOKS_STORAGE_KEY = "flexsell-webhooks-storage";

function getMockNotifications(): any[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(NOTIFS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing mock notifications", e);
    }
  }
  const defaultMock: any[] = [
    {
      _id: "notif_1",
      customerId: "60c72b2f9b1d8e001c8e2001",
      title: "Welcome to FlexSell Wholesale!",
      message: "Your B2B account has been verified successfully. Start exploring bulk discounts in the catalog.",
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];
  saveMockNotifications(defaultMock);
  return defaultMock;
}

function saveMockNotifications(notifs: any[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
}

function getMockWebhooks(): any[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(WEBHOOKS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing mock webhooks", e);
    }
  }
  const defaultMock: any[] = [
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

function saveMockWebhooks(webhooks: any[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WEBHOOKS_STORAGE_KEY, JSON.stringify(webhooks));
}

export const notificationService = {
  async getNotifications(): Promise<any[]> {
    if (isMockMode) {
      await delay();
      return getMockNotifications();
    }
    return apiClient.get<any[]>("/notifications");
  },

  async markAsRead(id: string): Promise<any> {
    if (isMockMode) {
      await delay();
      const list = getMockNotifications();
      let updated: any = null;
      const updatedList = list.map(n => {
        if (n._id === id) {
          updated = { ...n, isRead: true };
          return updated;
        }
        return n;
      });
      saveMockNotifications(updatedList);
      return updated;
    }
    return apiClient.put<any>("/notifications", { _id: id });
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

  async getWebhooksAdmin(): Promise<any[]> {
    if (isMockMode) {
      await delay();
      return getMockWebhooks();
    }
    return apiClient.get<any[]>("/admin/webhooks");
  },

  async addWebhookAdmin(data: { url: string; event: string }): Promise<any> {
    if (isMockMode) {
      await delay();
      const list = getMockWebhooks();
      const newWebhook = {
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
    return apiClient.post<any>("/admin/webhooks", data);
  },

  async toggleWebhookAdmin(id: string, isActive: boolean): Promise<any> {
    if (isMockMode) {
      await delay();
      const list = getMockWebhooks();
      let updated: any = null;
      const updatedList = list.map(w => {
        if (w._id === id) {
          updated = { ...w, isActive };
          return updated;
        }
        return w;
      });
      saveMockWebhooks(updatedList);
      return updated;
    }
    return apiClient.put<any>("/admin/webhooks", { _id: id, isActive });
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
