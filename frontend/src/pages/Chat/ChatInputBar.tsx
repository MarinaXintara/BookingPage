import { useState, useRef, useCallback} from "react";
import type { KeyboardEvent } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AttachmentType = "file" | "image";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: AttachmentType;
  file: File;
}

export interface ChatInputBarProps {
  /** Placeholder text shown in the textarea */
  placeholder?: string;
  /** Whether the input is disabled (e.g. while awaiting AI response) */
  disabled?: boolean;
  /** Whether to show the attachment button */
  showAttachments?: boolean;
  /** Whether to show the emoji picker button */
  showEmoji?: boolean;
  /** Max character count (undefined = no limit) */
  maxLength?: number;
  /** Called when the user submits a message */
  onSend: (message: string, attachments: Attachment[]) => void;
  /** Called when the user types (for "is typing" indicators) */
  onTyping?: () => void;
  /** Optional quick-reply suggestions shown above the input */
  suggestions?: string[];
  /** Called when a suggestion chip is clicked */
  onSuggestionClick?: (suggestion: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface AttachmentChipProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

function AttachmentChip({ attachment, onRemove }: AttachmentChipProps) {
  const isImage = attachment.type === "image";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px 4px 10px",
        background: "var(--color-background-secondary)",
        border: "0.5px solid var(--color-border-secondary)",
        borderRadius: 20,
        fontSize: 12,
        color: "var(--color-text-secondary)",
        maxWidth: 180,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <span style={{ fontSize: 14 }}>{isImage ? "🖼" : "📎"}</span>
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: "var(--color-text-primary)",
          fontWeight: 500,
        }}
      >
        {attachment.name}
      </span>
      <span style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}>
        {formatBytes(attachment.size)}
      </span>
      <button
        onClick={() => onRemove(attachment.id)}
        aria-label={`Remove ${attachment.name}`}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0 0 0 2px",
          color: "var(--color-text-tertiary)",
          fontSize: 14,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ChatInputBar({
  placeholder = "Ask about venues, dates, availability…",
  disabled = false,
  showAttachments = true,
  showEmoji = true,
  maxLength,
  onSend,
  onTyping,
  suggestions,
  onSuggestionClick,
}: ChatInputBarProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = maxLength
        ? e.target.value.slice(0, maxLength)
        : e.target.value;
      setValue(next);
      onTyping?.();

      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
      }
    },
    [maxLength, onTyping]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, attachments]
  );

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments);
    setValue("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, attachments, onSend]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const next: Attachment[] = Array.from(files).map((file) => ({
      id: uid(),
      name: file.name,
      size: file.size,
      type: file.type.startsWith("image/") ? "image" : "file",
      file,
    }));
    setAttachments((prev) => [...prev, ...next]);
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !disabled;
  const charCount = value.length;
  const showCharCount = maxLength !== undefined && charCount > maxLength * 0.8;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* Suggestion chips */}
      {suggestions && suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                onSuggestionClick?.(s);
                setValue(s);
                textareaRef.current?.focus();
              }}
              style={{
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                background: "var(--color-background-secondary)",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: 20,
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.borderColor =
                  "var(--color-border-primary)";
                (e.target as HTMLButtonElement).style.color =
                  "var(--color-text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.borderColor =
                  "var(--color-border-secondary)";
                (e.target as HTMLButtonElement).style.color =
                  "var(--color-text-secondary)";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Main input area */}
      <div
        style={{
          position: "relative",
          background: "var(--color-background-primary)",
          border: `0.5px solid ${focused ? "var(--color-border-primary)" : "var(--color-border-secondary)"}`,
          borderRadius: "var(--border-radius-lg, 12px)",
          transition: "border-color 0.15s",
          boxShadow: focused ? "0 0 0 3px var(--color-background-tertiary)" : "none",
        }}
      >
        {/* Attachment chips (above textarea) */}
        {attachments.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              padding: "10px 12px 4px",
            }}
          >
            {attachments.map((a) => (
              <AttachmentChip key={a.id} attachment={a} onRemove={removeAttachment} />
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          aria-label="Chat message input"
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            resize: "none",
            border: "none",
            outline: "none",
            background: "transparent",
            padding: "12px 14px 4px",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--color-text-primary)",
            fontFamily: "inherit",
            minHeight: 44,
            maxHeight: 180,
            overflowY: "auto",
            caretColor: "var(--color-text-primary)",
          }}
        />

        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px 8px",
          }}
        >
          {/* Left toolbar buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {showAttachments && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <ToolbarButton
                  label="Attach file"
                  disabled={disabled}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <AttachIcon />
                </ToolbarButton>
              </>
            )}

            {showEmoji && (
              <ToolbarButton label="Emoji" disabled={disabled} onClick={() => {}}>
                <EmojiIcon />
              </ToolbarButton>
            )}
          </div>

          {/* Right: char count + send */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {showCharCount && maxLength && (
              <span
                style={{
                  fontSize: 11,
                  color:
                    charCount >= maxLength
                      ? "var(--color-text-danger)"
                      : "var(--color-text-tertiary)",
                }}
              >
                {charCount}/{maxLength}
              </span>
            )}

            <button
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "none",
                cursor: canSend ? "pointer" : "default",
                background: canSend ? "var(--color-text-primary)" : "var(--color-background-tertiary)",
                color: canSend ? "var(--color-background-primary)" : "var(--color-text-tertiary)",
                transition: "background 0.15s, transform 0.1s",
                flexShrink: 0,
              }}
              onMouseDown={(e) => {
                if (canSend) (e.currentTarget as HTMLElement).style.transform = "scale(0.94)";
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Hint */}
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: "var(--color-text-tertiary)",
          paddingLeft: 2,
        }}
      >
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 6,
        border: "none",
        background: "transparent",
        color: disabled ? "var(--color-text-tertiary)" : "var(--color-text-secondary)",
        cursor: disabled ? "default" : "pointer",
        transition: "background 0.12s, color 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLElement).style.background =
            "var(--color-background-secondary)";
          (e.currentTarget as HTMLElement).style.color =
            "var(--color-text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color =
          "var(--color-text-secondary)";
      }}
    >
      {children}
    </button>
  );
}

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AttachIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M21.44 11.05L12.25 20.24C11.1241 21.3659 9.59778 21.9984 8.00502 21.9984C6.41226 21.9984 4.88593 21.3659 3.76002 20.24C2.63412 19.1141 2.00157 17.5878 2.00157 15.995C2.00157 14.4023 2.63412 12.876 3.76002 11.75L12.33 3.18C13.0806 2.42925 14.0991 2.00699 15.16 2.00699C16.2209 2.00699 17.2394 2.42925 17.99 3.18C18.7408 3.93064 19.163 4.94913 19.163 6.01001C19.163 7.07089 18.7408 8.08939 17.99 8.84001L9.41002 17.41C9.03466 17.7854 8.52573 17.9966 7.99502 17.9966C7.46431 17.9966 6.95539 17.7854 6.58002 17.41C6.20466 17.0347 5.99348 16.5257 5.99348 15.995C5.99348 15.4643 6.20466 14.9554 6.58002 14.58L15.07 6.10001"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmojiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 13s1.5 2 4 2 4-2 4-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

export default ChatInputBar;
