import type { WebSocketLike } from "@hono/node-server";
import { targetRooms, type NotificationEvent } from "../events.js";

export interface HubClient {
  socket: WebSocketLike;
  userId: string;
  role: string;
  rooms: Set<string>;
  alive: boolean;
  connectedAt: number;
}

export interface PublishResult {
  rooms: string[];
  delivered: number;
  dropped: number;
}

const HEARTBEAT_INTERVAL_MS = 30_000;
const MAX_ROOMS_PER_CLIENT = 50;

class ConnectionHub {
  private clients = new Map<WebSocketLike, HubClient>();
  private rooms = new Map<string, Set<WebSocketLike>>();
  private heartbeat: NodeJS.Timeout | null = null;

  add(socket: WebSocketLike, userId: string, role: string): HubClient {
    const client: HubClient = {
      socket,
      userId,
      role,
      rooms: new Set(),
      alive: true,
      connectedAt: Date.now(),
    };
    this.clients.set(socket, client);
    return client;
  }

  remove(socket: WebSocketLike): void {
    const client = this.clients.get(socket);
    if (!client) return;
    for (const room of client.rooms) {
      this.leaveRoom(socket, room);
    }
    this.clients.delete(socket);
  }

  /** Client answered the heartbeat — keep the socket. */
  markAlive(socket: WebSocketLike): void {
    const client = this.clients.get(socket);
    if (client) client.alive = true;
  }

  roomsOf(socket: WebSocketLike): string[] {
    const client = this.clients.get(socket);
    return client ? [...client.rooms] : [];
  }

  joinRoom(socket: WebSocketLike, room: string): boolean {
    const client = this.clients.get(socket);
    if (!client) return false;
    if (client.rooms.has(room)) return true;
    if (client.rooms.size >= MAX_ROOMS_PER_CLIENT) return false;

    client.rooms.add(room);
    let members = this.rooms.get(room);
    if (!members) {
      members = new Set();
      this.rooms.set(room, members);
    }
    members.add(socket);
    return true;
  }

  leaveRoom(socket: WebSocketLike, room: string): void {
    const client = this.clients.get(socket);
    client?.rooms.delete(room);

    const members = this.rooms.get(room);
    if (!members) return;
    members.delete(socket);
    if (members.size === 0) {
      this.rooms.delete(room);
    }
  }

  /**
   * Fan an event out to every socket subscribed to any of its target rooms.
   * A socket in several target rooms receives the event exactly once.
   */
  publish(event: NotificationEvent): PublishResult {
    const rooms = targetRooms(event);
    const recipients = new Set<WebSocketLike>();
    let dropped = 0;

    for (const room of rooms) {
      const members = this.rooms.get(room);
      if (!members) continue;
      for (const socket of members) recipients.add(socket);
    }

    const payload = JSON.stringify({ kind: "event", event });
    for (const socket of recipients) {
      if (!this.send(socket, payload)) dropped += 1;
    }

    return { rooms, delivered: recipients.size - dropped, dropped };
  }

  private send(socket: WebSocketLike, payload: string): boolean {
    try {
      if (socket.readyState !== 1) return false;
      socket.send(payload);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Drop sockets that stop answering `ping`. The `ws` server's own ping/pong
   * is not reachable through the `WebSocketLike` surface, so liveness is
   * tracked at the application layer instead.
   */
  startHeartbeat(): void {
    if (this.heartbeat) return;
    this.heartbeat = setInterval(() => {
      for (const client of this.clients.values()) {
        if (!client.alive) {
          try {
            client.socket.close(1001, "heartbeat timeout");
          } catch {
            // socket already gone
          }
          this.remove(client.socket);
          continue;
        }
        client.alive = false;
        this.send(client.socket, JSON.stringify({ kind: "ping" }));
      }
    }, HEARTBEAT_INTERVAL_MS);
    this.heartbeat.unref();
  }

  stopHeartbeat(): void {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
      this.heartbeat = null;
    }
  }

  stats() {
    return {
      connections: this.clients.size,
      rooms: this.rooms.size,
      subscribers: [...this.rooms.entries()].map(([room, members]) => ({
        room,
        subscribers: members.size,
      })),
    };
  }
}

export const hub = new ConnectionHub();
