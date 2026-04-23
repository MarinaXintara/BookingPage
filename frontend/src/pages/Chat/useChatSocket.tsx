import { useEffect, useRef, useCallback, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export type MessageType =
  | "chat"
  | "typing"
  | "stop_typing"
  | "read"
  | "ping"
  | "pong"
  | "error"
  | "join"
  | "leave";

export interface WsPayload {
  type: MessageType;
  roomId?: string;
  userId?: string;
  messageId?: string;
  content?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface UseChatSocketOptions {
  /** WebSocket server URL e.g. "wss://api.example.com/ws" */
  url: string;
  /** Room / conversation ID to join on connect */
  roomId: string;
  /** Current user's ID */
  userId: string;
  /** Called when a chat message arrives */
  onMessage?: (payload: WsPayload) => void;
  /** Called when the remote user starts typing */
  onTypingStart?: () => void;
  /** Called when the remote user stops typing */
  onTypingStop?: () => void;
  /** Called when connection status changes */
  onStatusChange?: (status: ConnectionStatus) => void;
  /** Reconnect automatically (default: true) */
  autoReconnect?: boolean;
  /** Max reconnect attempts (default: 5) */
  maxRetries?: number;
  /** Base delay in ms between retries — doubles each attempt (default: 1000) */
  reconnectDelay?: number;
}

export interface UseChatSocketReturn {
  /** Current connection status */
  status: ConnectionStatus;
  /** Send a chat message */
  sendMessage: (content: string) => void;
  /** Emit typing started */
  sendTypingStart: () => void;
  /** Emit typing stopped */
  sendTypingStop: () => void;
  /** Send a read receipt for a message */
  sendReadReceipt: (messageId: string) => void;
  /** Manually close the connection */
  disconnect: () => void;
  /** Manually reconnect */
  reconnect: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChatSocket({
  url,
  roomId,
  userId,
  onMessage,
  onTypingStart,
  onTypingStop,
  onStatusChange,
  autoReconnect = true,
  maxRetries = 5,
  reconnectDelay = 1000,
}: UseChatSocketOptions): UseChatSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  const updateStatus = useCallback(
    (next: ConnectionStatus) => {
      setStatus(next);
      onStatusChange?.(next);
    },
    [onStatusChange]
  );

  const send = useCallback((payload: WsPayload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const startPing = useCallback(() => {
    pingTimerRef.current = setInterval(() => {
      send({ type: "ping", userId, timestamp: new Date().toISOString() });
    }, 30_000);
  }, [send, userId]);

  const stopPing = useCallback(() => {
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    // Clean up any existing socket
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
    }

    intentionalCloseRef.current = false;
    updateStatus("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      updateStatus("connected");
      startPing();
      // Join the room
      send({ type: "join", roomId, userId, timestamp: new Date().toISOString() });
    };

    ws.onmessage = (event: MessageEvent) => {
      let payload: WsPayload;
      try {
        payload = JSON.parse(event.data as string) as WsPayload;
      } catch {
        console.warn("[useChatSocket] Failed to parse message:", event.data);
        return;
      }

      switch (payload.type) {
        case "chat":
          onMessage?.(payload);
          break;
        case "typing":
          onTypingStart?.();
          break;
        case "stop_typing":
          onTypingStop?.();
          break;
        case "pong":
          // heartbeat acknowledged — nothing to do
          break;
        case "error":
          console.error("[useChatSocket] Server error:", payload);
          break;
        default:
          onMessage?.(payload);
      }
    };

    ws.onerror = () => {
      updateStatus("error");
    };

    ws.onclose = () => {
      stopPing();

      if (intentionalCloseRef.current) {
        updateStatus("disconnected");
        return;
      }

      updateStatus("disconnected");

      if (autoReconnect && retriesRef.current < maxRetries) {
        const delay = reconnectDelay * Math.pow(2, retriesRef.current);
        retriesRef.current += 1;
        retryTimerRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else if (retriesRef.current >= maxRetries) {
        updateStatus("error");
      }
    };
  }, [
    url,
    roomId,
    userId,
    autoReconnect,
    maxRetries,
    reconnectDelay,
    send,
    startPing,
    stopPing,
    updateStatus,
    onMessage,
    onTypingStart,
    onTypingStop,
  ]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    stopPing();
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    send({ type: "leave", roomId, userId });
    wsRef.current?.close();
  }, [send, stopPing, roomId, userId]);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    connect();
  }, [connect]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      intentionalCloseRef.current = true;
      stopPing();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
    };
    // connect is stable — only re-run if url/roomId/userId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, roomId, userId]);

  // ── Public API ──────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (content: string) => {
      send({
        type: "chat",
        roomId,
        userId,
        content,
        timestamp: new Date().toISOString(),
      });
    },
    [send, roomId, userId]
  );

  const sendTypingStart = useCallback(() => {
    send({ type: "typing", roomId, userId });
  }, [send, roomId, userId]);

  const sendTypingStop = useCallback(() => {
    send({ type: "stop_typing", roomId, userId });
  }, [send, roomId, userId]);

  const sendReadReceipt = useCallback(
    (messageId: string) => {
      send({ type: "read", roomId, userId, messageId });
    },
    [send, roomId, userId]
  );

  return {
    status,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    sendReadReceipt,
    disconnect,
    reconnect,
  };
}