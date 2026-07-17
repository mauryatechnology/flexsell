import dbConnect from "@/lib/dbConnect";
import WebhookSubscription from "@/models/WebhookSubscription";
import Notification from "@/models/Notification";
import crypto from "crypto";

type WebhookEvent = "order.created" | "order.status_updated" | "customer.created";

/**
 * Dispatches a webhook notification to all active subscribers for the event
 * and records an in-app notification if customerId is provided.
 */
export async function dispatchWebhook(
  event: WebhookEvent,
  payload: any,
  customerId?: string,
  notifConfig?: { title: string; message: string; type: "info" | "order" | "success" | "warning" }
) {
  try {
    await dbConnect();

    // 1. Create in-app notification if configured
    if (customerId && notifConfig) {
      try {
        await Notification.create({
          customerId,
          title: notifConfig.title,
          message: notifConfig.message,
          type: notifConfig.type,
          isRead: false
        });
        console.log(`[Notification] In-app notification created for customer ${customerId}`);
      } catch (notifErr) {
        console.error("[Notification] Failed to create in-app notification:", notifErr);
      }
    }

    // 2. Fetch active webhook subscriptions matching the event
    const subscriptions = await WebhookSubscription.find({ event, isActive: true }).lean();
    if (subscriptions.length === 0) {
      console.log(`[Webhook] No active subscriptions found for event: ${event}`);
      return;
    }

    const payloadString = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload
    });

    console.log(`[Webhook] Dispatching event "${event}" to ${subscriptions.length} subscribers...`);

    // Dispatch concurrently
    await Promise.all(
      subscriptions.map(async (sub: any) => {
        try {
          // Sign payload using HMAC SHA256 (Industry standard verification)
          const signature = crypto
            .createHmac("sha256", sub.secret)
            .update(payloadString)
            .digest("hex");

          const response = await fetch(sub.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Flexsell-Event": event,
              "X-Flexsell-Signature": signature,
              "User-Agent": "Flexsell-Webhook-Dispatcher/1.0"
            },
            body: payloadString
          });

          if (response.ok) {
            console.log(`[Webhook] Successfully delivered to URL: ${sub.url} (Status: ${response.status})`);
          } else {
            console.warn(`[Webhook] Delivery failed to URL: ${sub.url} (Status: ${response.status})`);
          }
        } catch (err: unknown) {
          console.error(`[Webhook] Network error during delivery to ${sub.url}:`, (err as any).message);
        }
      })
    );
  } catch (error: unknown) {
    console.error(`[Webhook Dispatcher] Global dispatcher error:`, (error as any).message);
  }
}
