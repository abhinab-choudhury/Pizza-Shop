/**
 * Event contracts for the notification pipeline.
 *
 * NOTE: these types are duplicated from ARCHITECTURE.md §5. Once
 * `packages/domain` exists (ARCHITECTURE.md:227) they should move there and be
 * imported by both the publishing services and this one, so the producer and
 * consumer can never drift.
 *
 * Start events, per ARCHITECTURE.md:174-175.
 */

export const EVENT_TYPES = [
  "order.placed",
  "payment.captured",
  "order.ready_for_pickup",
  "delivery.assigned",
  "delivery.out_for_delivery",
  "delivery.delivered",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

interface EventBase {
  orderId: string;
  userId: string;
  occurredAt: string;
}

export type NotificationEvent =
  | (EventBase & {
      type: "order.placed";
      data: { totalCents: number; itemCount: number };
    })
  | (EventBase & {
      type: "payment.captured";
      data: { paymentId: string; amountCents: number };
    })
  | (EventBase & {
      type: "order.ready_for_pickup";
      data: { etaMinutes: number };
    })
  | (EventBase & {
      type: "delivery.assigned";
      data: { riderId: string; riderName: string };
    })
  | (EventBase & {
      type: "delivery.out_for_delivery";
      data: { riderId: string; lat: number; lng: number };
    })
  | (EventBase & {
      type: "delivery.delivered";
      data: { deliveredAt: string };
    });

/**
 * Rooms an event should be delivered to. A client subscribed to any one of
 * these receives the event exactly once, even if it is in several rooms.
 */
export function targetRooms(event: NotificationEvent): string[] {
  const rooms = [orderRoom(event.orderId), userRoom(event.userId)];

  if (event.type === "delivery.assigned") {
    rooms.push(riderRoom(event.data.riderId));
  }

  return rooms;
}

export function orderRoom(orderId: string): string {
  return `order:${orderId}`;
}

export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function riderRoom(riderId: string): string {
  return `rider:${riderId}`;
}

export const ROOM_PREFIXES = ["order", "user", "rider"] as const;
export type RoomPrefix = (typeof ROOM_PREFIXES)[number];

export function isValidRoom(room: string): boolean {
  return ROOM_PREFIXES.some((prefix) => room.startsWith(`${prefix}:`));
}
