import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus = "sending" | "sent" | "error";

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: "file" | "image";
  /** Optional preview URL for images */
  previewUrl?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  attachments?: MessageAttachment[];
}

export interface MessageListProps {
  messages: Message[];
  /** Name shown for the assistant */
  assistantName?: string;
  /** Avatar/initials for the assistant */
  assistantAvatar?: ReactNode;
  /** Whether to auto-scroll to the latest message */
  autoScroll?: boolean;
  /** Show a typing indicator at the bottom */
  isTyping?: boolean;
  /** Empty state message */
  emptyText?: string;
  /** Called when user clicks Retry on an errored message */
  onRetry?: (message: Message) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

/** Groups messages by calendar day */
function groupByDay(messages: Message[]): Array<{ label: string; messages: Message[] }> {
  const groups: Array<{ label: string; date: string; messages: Message[] }> = [];

  for (const msg of messages) {
    const dateStr = msg.timestamp.toDateString();
    const last = groups[groups.length - 1];
    if (last && last.date === dateStr) {
      last.messages.push(msg);
    } else {
      groups.push({ label: formatDateLabel(msg.timestamp), date: dateStr, messages: [msg] });
    }
  }

  return groups;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
  const isImage = attachment.type === "image";

  if (isImage && attachment.previewUrl) {
    return (
      <img
        src={attachment.previewUrl}
        alt={attachment.name}
        style={{
          maxWidth: 220,
          maxHeight: 160,
          borderRadius: 8,
          objectFit: "cover",
          display: "block",
          border: "0.5px solid var(--color-border-tertiary)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 10px",
        background: "rgba(0,0,0,0.06)",
        borderRadius: 8,
        fontSize: 12,
        maxWidth: 220,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{isImage ? "🖼" : "📎"}</span>
      <div style={{ overflow: "hidden" }}>
        <div
          style={{
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {attachment.name}
        </div>
        <div style={{ opacity: 0.6, fontSize: 11 }}>{formatBytes(attachment.size)}</div>
      </div>
    </div>
  );
}

function TypingIndicator({ assistantAvatar }: { assistantAvatar?: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        padding: "4px 0",
      }}
    >
      <Avatar>{assistantAvatar ?? "✦"}</Avatar>
      <div
        style={{
          padding: "10px 14px",
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: "16px 16px 16px 4px",
          display: "flex",
          gap: 5,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-text-tertiary)",
              display: "inline-block",
              animation: "bounce 1.2s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Avatar({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-secondary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        flexShrink: 0,
        color: "var(--color-text-secondary)",
      }}
    >
      {children}
    </div>
  );
}

function DateDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        margin: "8px 0",
      }}
    >
      <div style={{ flex: 1, height: "0.5px", background: "var(--color-border-tertiary)" }} />
      <span
        style={{
          fontSize: 11,
          color: "var(--color-text-tertiary)",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: "0.5px", background: "var(--color-border-tertiary)" }} />
    </div>
  );
}

function SystemMessage({ content }: { content: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 12,
        color: "var(--color-text-tertiary)",
        padding: "4px 0",
        fontStyle: "italic",
      }}
    >
      {content}
    </div>
  );
}

function MessageBubble({
  message,
  assistantAvatar,
  onRetry,
}: {
  message: Message;
  assistantAvatar?: ReactNode;
  onRetry?: (message: Message) => void;
}) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const isSending = message.status === "sending";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 10,
        alignItems: "flex-end",
        padding: "2px 0",
      }}
    >
      {/* Avatar — only for assistant */}
      {!isUser && <Avatar>{assistantAvatar ?? "✦"}</Avatar>}

      {/* Bubble + meta */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 4,
          maxWidth: "72%",
        }}
      >
        {/* Attachments above text */}
        {message.attachments && message.attachments.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: isUser ? "flex-end" : "flex-start",
            }}
          >
            {message.attachments.map((a) => (
              <div
                key={a.id}
                style={{ color: isUser ? "white" : "var(--color-text-primary)" }}
              >
                <AttachmentPreview attachment={a} />
              </div>
            ))}
          </div>
        )}

        {/* Text bubble */}
        {message.content && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: isError
                ? "var(--color-background-danger)"
                : isUser
                ? "var(--color-text-primary)"
                : "var(--color-background-secondary)",
              border: isUser
                ? "none"
                : "0.5px solid var(--color-border-tertiary)",
              color: isUser
                ? "var(--color-background-primary)"
                : "var(--color-text-primary)",
              fontSize: 14,
              lineHeight: 1.6,
              opacity: isSending ? 0.6 : 1,
              transition: "opacity 0.2s",
              wordBreak: "break-word",
            }}
          >
            {message.content}
          </div>
        )}

        {/* Timestamp + status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: "var(--color-text-tertiary)",
          }}
        >
          {isSending && <span>Sending…</span>}
          {isError && (
            <>
              <span style={{ color: "var(--color-text-danger)" }}>Failed to send</span>
              {onRetry && (
                <button
                  onClick={() => onRetry(message)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--color-text-info)",
                    fontSize: 11,
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Retry
                </button>
              )}
            </>
          )}
          {!isSending && !isError && <span>{formatTime(message.timestamp)}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MessageList({
  messages,
  assistantName = "Assistant",
  assistantAvatar,
  autoScroll = true,
  isTyping = false,
  emptyText = "No messages yet. Ask anything about venues and events.",
  onRetry,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, autoScroll]);

  const groups = groupByDay(messages);

  return (
    <>
      {/* Bounce keyframe */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>

      <div
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          padding: "16px 0",
          overflowY: "auto",
          flex: 1,
          fontFamily: "var(--font-sans, system-ui, sans-serif)",
        }}
      >
        {/* Empty state */}
        {messages.length === 0 && !isTyping && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-tertiary)",
              fontSize: 14,
              textAlign: "center",
              padding: "0 24px",
            }}
          >
            {emptyText}
          </div>
        )}

        {/* Message groups */}
        {groups.map((group) => (
          <div key={group.label}>
            <DateDivider label={group.label} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {group.messages.map((msg) =>
                msg.role === "system" ? (
                  <SystemMessage key={msg.id} content={msg.content} />
                ) : (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    assistantAvatar={assistantAvatar}
                    onRetry={onRetry}
                  />
                )
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator assistantAvatar={assistantAvatar} />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </>
  );
}

export default MessageList;
