"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Truck, ArrowLeft } from "lucide-react";
import { ShipmentDetails } from "@/stores/orderStore";

interface FulfillmentFormProps {
  orderId: string;
  onShip: (details: ShipmentDetails) => Promise<void>;
  onCancel: () => void;
}

export function FulfillmentForm({ orderId, onShip, onCancel }: FulfillmentFormProps) {
  const [shipType, setShipType] = React.useState<"self" | "third-party">("self");
  const [carrierName, setCarrierName] = React.useState("");
  const [trackingId, setTrackingId] = React.useState("");
  const [trackingUrl, setTrackingUrl] = React.useState("");
  const [estDelivery, setEstDelivery] = React.useState("");
  const [dispatchNotes, setDispatchNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Generate track ID for self shipment
  React.useEffect(() => {
    if (shipType === "self") {
      const randNum = Math.floor(100000 + Math.random() * 900000);
      setTrackingId(`FLEX-IN-${orderId.replace("FS-", "")}-${randNum}`);
    } else {
      setTrackingId("");
    }
  }, [shipType, orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shipType === "third-party" && (!carrierName.trim() || !trackingId.trim())) {
      alert("Please provide the Carrier Name and Tracking ID for third-party courier dispatch.");
      return;
    }

    setIsSubmitting(false);
    const details: ShipmentDetails = {
      type: shipType,
      carrierName: shipType === "third-party" ? carrierName.trim() : undefined,
      trackingId: trackingId.trim(),
      trackingUrl: shipType === "third-party" ? trackingUrl.trim() || undefined : undefined,
      estimatedDelivery: estDelivery.trim() || undefined,
      shippedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      notes: dispatchNotes.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      await onShip(details);
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <div>
          <CardTitle className="text-sm font-bold uppercase flex items-center gap-1.5 text-primary">
            <Truck className="h-4.5 w-4.5" /> Fulfill Order Shipment
          </CardTitle>
          <CardDescription className="text-[10px] font-mono">{orderId}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Courier Service</label>
            <select
              value={shipType}
              onChange={(e) => setShipType(e.target.value as any)}
              className="bg-background text-foreground text-sm w-full px-3 py-2 border rounded-md font-semibold cursor-pointer h-10"
            >
              <option value="self">FlexSell Self Dispatch (In-House Order)</option>
              <option value="third-party">Third-Party Courier Services</option>
            </select>
          </div>

          {shipType === "third-party" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Carrier Name *</label>
              <Input
                required
                value={carrierName}
                onChange={(e) => setCarrierName(e.target.value)}
                placeholder="e.g. BlueDart, Delhivery, DHL"
                className="text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Tracking / Waybill ID * {shipType === "self" && "(Auto-Generated)"}
            </label>
            <Input
              required
              readOnly={shipType === "self"}
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. 7849102834"
              className="text-sm font-mono font-bold"
            />
          </div>

          {shipType === "third-party" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Tracking URL Reference</label>
              <Input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://carrier.com/track/id"
                type="url"
                className="text-sm font-mono"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Estimated Delivery Date</label>
            <Input
              type="date"
              min={todayStr}
              value={estDelivery}
              onChange={(e) => setEstDelivery(e.target.value)}
              className="text-sm cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Dispatch Notes</label>
            <textarea
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              placeholder="Add packages weight, seal numbers or instructions..."
              className="bg-background text-foreground text-sm w-full px-3 py-2 border rounded-md h-20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="font-semibold bg-primary text-primary-foreground">
              {isSubmitting ? "Confirming Dispatch..." : "Confirm Order Dispatch"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
