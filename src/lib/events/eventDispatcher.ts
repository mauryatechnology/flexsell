import { handleSystemEvent } from "./eventHandlers";

export interface SystemEventPayload {
  eventId?: string;
  eventType: string;
  category: "orders" | "shipments" | "payments" | "quotes" | "invoices" | "security" | "system";
  actor: {
    id: string;
    name: string;
    role: "customer" | "admin" | "system";
  };
  recipient: {
    customerId?: string;
    email?: string;
    name?: string;
    role: "customer" | "admin" | "both";
  };
  entity: {
    type: string;
    id: string;
  };
  data?: Record<string, any>;
  timestamp?: string;
}

export function dispatchEvent(payload: SystemEventPayload): void {
  const fullPayload: SystemEventPayload = {
    ...payload,
    eventId: payload.eventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: payload.timestamp || new Date().toISOString(),
  };

  console.log(`[EVENT DISPATCHED] Type: ${fullPayload.eventType} | Entity: ${fullPayload.entity.type}:${fullPayload.entity.id}`);

  // Non-blocking asynchronous event handling execution
  setTimeout(() => {
    handleSystemEvent(fullPayload).catch((err) => {
      console.error(`[EVENT HANDLER ERROR] Unhandled exception in event ${fullPayload.eventType}:`, err);
    });
  }, 0);
}
