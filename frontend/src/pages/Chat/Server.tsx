/// <reference types="node" />

import { WebSocketServer, WebSocket } from "ws";
import { createServer } from "http";
import { randomUUID } from "crypto";

// ─── Config ───────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 8080);
const PING_INTERVAL_MS = 30_000;

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageType =
  | "chat"
  | "typing"
  | "stop_typing"
  | "read"
  | "ping"
  | "pong"
  | "join"
  | "leave"
  | "error"
  | "user_joined"
  | "user_left";

interface WsPayload {
  type: MessageType;
  roomId?: string;
  userId?: string;
  messageId?: string;
  content?: string;
  timestamp?: string;
  [key: string]: unknown;
}

interface Client {
  id: string;
  userId: string;
  roomId: string;
  socket: WebSocket;
  alive: boolean;
}

// ─── State ────────────────────────────────────────────────────────────────────

/** roomId → Set of client IDs */
const rooms = new Map<string, Set<string>>();
/** clientId → Client */
const clients = new Map<string, Client>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function send(socket: WebSocket, payload: WsPayload): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function broadcast(roomId: string, payload: WsPayload, excludeClientId?: string): void {
  const room = rooms.get(roomId);
  if (!room) return;

  for (const clientId of room) {
    if (clientId === excludeClientId) continue;
    const client = clients.get(clientId);
    if (client) send(client.socket, payload);
  }
}

function broadcastAll(roomId: string, payload: WsPayload): void {
  broadcast(roomId, payload);
}

function joinRoom(client: Client): void {
  if (!rooms.has(client.roomId)) {
    rooms.set(client.roomId, new Set());
  }
  rooms.get(client.roomId)!.add(client.id);
}

function leaveRoom(client: Client): void {
  const room = rooms.get(client.roomId);
  if (!room) return;
  room.delete(client.id);
  if (room.size === 0) rooms.delete(client.roomId);
}

function removeClient(clientId: string): void {
  const client = clients.get(clientId);
  if (!client) return;

  leaveRoom(client);
  clients.delete(clientId);

  broadcast(client.roomId, {
    type: "user_left",
    userId: client.userId,
    roomId: client.roomId,
    timestamp: new Date().toISOString(),
  });

  console.log(`[ws] client left  userId=${client.userId} room=${client.roomId} total=${clients.size}`);
}

// ─── Server ───────────────────────────────────────────────────────────────────

const httpServer = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running\n");
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (socket: WebSocket) => {
  const clientId = randomUUID();

  // Temporary placeholder until "join" message arrives
  const client: Client = {
    id: clientId,
    userId: "unknown",
    roomId: "lobby",
    socket,
    alive: true,
  };
  clients.set(clientId, client);

  console.log(`[ws] new connection id=${clientId} total=${clients.size}`);

  // ── Incoming messages ────────────────────────────────────────────────────────
  socket.on("message", (raw) => {
    let payload: WsPayload;

    try {
      payload = JSON.parse(raw.toString()) as WsPayload;
    } catch {
      send(socket, { type: "error", content: "Invalid JSON" });
      return;
    }

    const ts = new Date().toISOString();

    switch (payload.type) {
      // Client announces which room and user they are
      case "join": {
        const { roomId = "lobby", userId = clientId } = payload;

        // Move out of old room if needed
        leaveRoom(client);

        client.userId = userId;
        client.roomId = roomId;
        joinRoom(client);

        console.log(`[ws] join  userId=${userId} room=${roomId}`);

        // Notify others
        broadcast(roomId, {
          type: "user_joined",
          userId,
          roomId,
          timestamp: ts,
        }, clientId);

        break;
      }

      case "leave": {
        removeClient(clientId);
        break;
      }

      // Regular chat message — broadcast to everyone in the room
      case "chat": {
        if (!payload.content?.trim()) break;

        const msg: WsPayload = {
          type: "chat",
          messageId: randomUUID(),
          userId: client.userId,
          roomId: client.roomId,
          content: payload.content,
          timestamp: ts,
        };

        console.log(`[ws] chat  userId=${client.userId} room=${client.roomId} "${payload.content?.slice(0, 60)}"`);

        // Echo back to sender (with messageId) + broadcast to room
        send(socket, msg);
        broadcast(client.roomId, msg, clientId);
        break;
      }

      // Typing indicators — broadcast to others only
      case "typing":
      case "stop_typing": {
        broadcast(client.roomId, {
          type: payload.type,
          userId: client.userId,
          roomId: client.roomId,
          timestamp: ts,
        }, clientId);
        break;
      }

      // Read receipt — broadcast to others
      case "read": {
        broadcast(client.roomId, {
          type: "read",
          userId: client.userId,
          messageId: payload.messageId,
          roomId: client.roomId,
          timestamp: ts,
        }, clientId);
        break;
      }

      // Heartbeat
      case "ping": {
        client.alive = true;
        send(socket, { type: "pong", timestamp: ts });
        break;
      }

      default:
        send(socket, { type: "error", content: `Unknown type: ${payload.type}` });
    }
  });

  // ── Disconnect ───────────────────────────────────────────────────────────────
  socket.on("close", () => {
    removeClient(clientId);
  });

  socket.on("error", (err) => {
    console.error(`[ws] error id=${clientId}`, err.message);
    removeClient(clientId);
  });
});

// ─── Heartbeat (server-side dead connection sweep) ────────────────────────────

const heartbeat = setInterval(() => {
  for (const [clientId, client] of clients) {
    if (!client.alive) {
      console.log(`[ws] stale connection, dropping id=${clientId}`);
      client.socket.terminate();
      removeClient(clientId);
      continue;
    }
    client.alive = false; // reset; client must pong before next sweep
  }
}, PING_INTERVAL_MS);

wss.on("close", () => clearInterval(heartbeat));

// ─── Start ────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`[ws] server listening on ws://localhost:${PORT}`);
});