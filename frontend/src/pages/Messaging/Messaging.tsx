import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../Auth/useAuth";
import {
  deleteMessage,
  getAvailableRecipients,
  getInbox,
  getSentMessages,
  markMessageAsRead,
  sendMessage,
  type Message,
  type MessageContact,
  type MessageFolder,
  type MessagingRole,
  type SendMessageInput,
} from "./messagingApi";
import "./Messaging.css";

interface SelectedMessage {
  folder: MessageFolder;
  id: string;
}

interface ComposeDefaults {
  eventId?: number;
  receiverId?: number;
  subject?: string;
  isReply?: boolean;
}

interface MailboxState {
  status: "loading" | "ready" | "error";
  inbox: Message[];
  sent: Message[];
  contacts: MessageContact[];
  error: string;
}

interface Feedback {
  type: "success" | "error";
  text: string;
}

interface MessageListProps {
  folder: MessageFolder;
  messages: Message[];
  selectedId?: string;
  onSelect: (folder: MessageFolder, message: Message) => void;
}

interface MessageDetailsProps {
  folder: MessageFolder;
  message: Message;
  isDeleting: boolean;
  onDelete: () => void;
  onReply: () => void;
}

interface ComposeFormProps {
  contacts: MessageContact[];
  defaults: ComposeDefaults;
  isSending: boolean;
  onCancel: () => void;
  onSend: (input: SendMessageInput) => Promise<boolean>;
}

const listDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
});

const detailsDateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatListDate(date: string): string {
  return listDateFormatter.format(new Date(date));
}

function formatDetailsDate(date: string): string {
  return detailsDateFormatter.format(new Date(date));
}

function MessageList({
  folder,
  messages,
  selectedId,
  onSelect,
}: MessageListProps) {
  const title = folder === "inbox" ? "Inbox" : "Sent";
  const unreadCount =
    folder === "inbox"
      ? messages.filter((message) => !message.isRead).length
      : 0;

  return (
    <section className="message-folder" aria-labelledby={`${folder}-heading`}>
      <div className="message-folder__heading">
        <h2 id={`${folder}-heading`}>{title}</h2>
        {unreadCount > 0 ? (
          <span className="message-folder__count" aria-label={`${unreadCount} unread`}>
            {unreadCount}
          </span>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <p className="message-folder__empty">No {title.toLowerCase()} messages.</p>
      ) : (
        <div className="message-list">
          {messages.map((message) => {
            const contactName =
              folder === "inbox" ? message.senderName : message.receiverName;

            return (
              <button
                className={`message-row${selectedId === message.id ? " message-row--selected" : ""}`}
                key={message.id}
                type="button"
                aria-pressed={selectedId === message.id}
                onClick={() => onSelect(folder, message)}
              >
                <span className="message-row__top">
                  <strong>
                    {folder === "inbox" && !message.isRead ? (
                      <span className="message-row__unread" aria-label="Unread message">
                        ●
                      </span>
                    ) : null}
                    {contactName}
                  </strong>
                  <time dateTime={message.createdAt}>
                    {formatListDate(message.createdAt)}
                  </time>
                </span>
                <span className="message-row__subject">{message.subject}</span>
                <span className="message-row__preview">{message.body}</span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MessageDetails({
  folder,
  message,
  isDeleting,
  onDelete,
  onReply,
}: MessageDetailsProps) {
  return (
    <article className="message-details">
      <header className="message-details__header">
        <p className="message-details__event">{message.eventTitle}</p>
        <h2>{message.subject}</h2>
        <dl className="message-details__meta">
          <div>
            <dt>{folder === "inbox" ? "From" : "To"}</dt>
            <dd>
              {folder === "inbox" ? message.senderName : message.receiverName}
            </dd>
          </div>
          <div>
            <dt>Sent</dt>
            <dd>
              <time dateTime={message.createdAt}>
                {formatDetailsDate(message.createdAt)}
              </time>
            </dd>
          </div>
        </dl>
      </header>

      <p className="message-details__body">{message.body}</p>

      <footer className="message-details__actions">
        {folder === "inbox" ? (
          <button className="messaging-button messaging-button--primary" type="button" onClick={onReply}>
            Reply
          </button>
        ) : null}
        <button
          className="messaging-button messaging-button--danger"
          type="button"
          disabled={isDeleting}
          onClick={onDelete}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </footer>
    </article>
  );
}

function ComposeForm({
  contacts,
  defaults,
  isSending,
  onCancel,
  onSend,
}: ComposeFormProps) {
  const firstContact = contacts[0];
  const [eventId, setEventId] = useState(
    defaults.eventId ?? firstContact?.eventId ?? 0,
  );
  const [receiverId, setReceiverId] = useState(
    defaults.receiverId ?? firstContact?.userId ?? 0,
  );
  const [subject, setSubject] = useState(defaults.subject ?? "");
  const [body, setBody] = useState("");
  const [validationError, setValidationError] = useState("");

  const events = useMemo(() => {
    const eventMap = new Map<number, string>();
    contacts.forEach((contact) => {
      eventMap.set(contact.eventId, contact.eventTitle);
    });
    return Array.from(eventMap, ([id, title]) => ({ id, title }));
  }, [contacts]);

  const availableRecipients = contacts.filter(
    (contact) => contact.eventId === eventId,
  );
  const selectedContact = contacts.find(
    (contact) =>
      contact.eventId === eventId && contact.userId === receiverId,
  );

  function handleEventChange(nextEventId: number) {
    const firstRecipient = contacts.find(
      (contact) => contact.eventId === nextEventId,
    );
    setEventId(nextEventId);
    setReceiverId(firstRecipient?.userId ?? 0);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (!selectedContact) {
      setValidationError("Please select a recipient and event.");
      return;
    }

    if (!subject.trim()) {
      setValidationError("Please enter a subject.");
      return;
    }

    if (!body.trim()) {
      setValidationError("Please enter a message.");
      return;
    }

    await onSend({
      receiverId: selectedContact.userId,
      eventId: selectedContact.eventId,
      subject,
      body,
    });
  }

  if (contacts.length === 0) {
    return (
      <section className="message-compose message-compose--empty">
        <h2>New message</h2>
        <p>You do not have any event contacts available yet.</p>
        <button className="messaging-button" type="button" onClick={onCancel}>
          Cancel
        </button>
      </section>
    );
  }

  return (
    <section className="message-compose" aria-labelledby="compose-heading">
      <h2 id="compose-heading">
        {defaults.isReply ? "Reply to message" : "New message"}
      </h2>

      <form onSubmit={handleSubmit}>
        {defaults.isReply && selectedContact ? (
          <div className="message-compose__reply-details">
            <p>
              <strong>To:</strong> {selectedContact.name}
            </p>
            <p>
              <strong>Event:</strong> {selectedContact.eventTitle}
            </p>
          </div>
        ) : (
          <div className="message-compose__fields">
            <label htmlFor="message-event">Event</label>
            <select
              id="message-event"
              value={eventId}
              onChange={(event) => handleEventChange(Number(event.target.value))}
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>

            <label htmlFor="message-recipient">Recipient</label>
            <select
              id="message-recipient"
              value={receiverId}
              onChange={(event) => setReceiverId(Number(event.target.value))}
            >
              {availableRecipients.map((contact) => (
                <option key={contact.userId} value={contact.userId}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <label htmlFor="message-subject">Subject</label>
        <input
          id="message-subject"
          type="text"
          maxLength={120}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />

        <label htmlFor="message-body">Message</label>
        <textarea
          id="message-body"
          maxLength={2000}
          rows={8}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />

        {validationError ? (
          <p className="messaging-feedback messaging-feedback--error" role="alert">
            {validationError}
          </p>
        ) : null}

        <div className="message-compose__actions">
          <button
            className="messaging-button messaging-button--primary"
            type="submit"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send message"}
          </button>
          <button
            className="messaging-button"
            type="button"
            disabled={isSending}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default function Messaging() {
  const { user } = useAuth();
  const role: MessagingRole | null =
    user?.role === "USER" || user?.role === "ORGANIZER" ? user.role : null;
  const [mailbox, setMailbox] = useState<MailboxState>({
    status: "loading",
    inbox: [],
    sent: [],
    contacts: [],
    error: "",
  });
  const [selected, setSelected] = useState<SelectedMessage | null>(null);
  const [composeDefaults, setComposeDefaults] =
    useState<ComposeDefaults | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (!role) {
      return;
    }

    const controller = new AbortController();

    Promise.all([
      getInbox(role, controller.signal),
      getSentMessages(role, controller.signal),
      getAvailableRecipients(role, controller.signal),
    ])
      .then(([inbox, sent, contacts]) => {
        setMailbox({ status: "ready", inbox, sent, contacts, error: "" });
        setSelected(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setMailbox((current) => ({
          ...current,
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Messages could not be loaded.",
        }));
      });

    return () => controller.abort();
  }, [role, loadAttempt]);

  if (user?.role === "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  if (!role) {
    return null;
  }

  const activeRole: MessagingRole = role;

  const selectedMessages =
    selected?.folder === "inbox" ? mailbox.inbox : mailbox.sent;
  const selectedMessage = selected
    ? selectedMessages.find((message) => message.id === selected.id)
    : undefined;

  function handleRetry() {
    setMailbox((current) => ({
      ...current,
      status: "loading",
      error: "",
    }));
    setSelected(null);
    setComposeDefaults(null);
    setFeedback(null);
    setLoadAttempt((attempt) => attempt + 1);
  }

  async function handleSelect(folder: MessageFolder, message: Message) {
    setSelected({ folder, id: message.id });
    setComposeDefaults(null);
    setFeedback(null);

    if (folder !== "inbox" || message.isRead) {
      return;
    }

    setMailbox((current) => ({
      ...current,
      inbox: current.inbox.map((item) =>
        item.id === message.id ? { ...item, isRead: true } : item,
      ),
    }));

    try {
      await markMessageAsRead(activeRole, message.id);
    } catch (error: unknown) {
      setMailbox((current) => ({
        ...current,
        inbox: current.inbox.map((item) =>
          item.id === message.id ? { ...item, isRead: false } : item,
        ),
      }));
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "The message could not be marked as read.",
      });
    }
  }

  async function handleSend(input: SendMessageInput): Promise<boolean> {
    setIsSending(true);
    setFeedback(null);

    try {
      const sentMessage = await sendMessage(activeRole, input);
      setMailbox((current) => ({
        ...current,
        sent: [sentMessage, ...current.sent],
      }));
      setSelected({ folder: "sent", id: sentMessage.id });
      setComposeDefaults(null);
      setFeedback({ type: "success", text: "Message sent." });
      return true;
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "The message could not be sent.",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  }

  async function handleDelete() {
    if (!selected || !selectedMessage) {
      return;
    }

    const shouldDelete = window.confirm(
      "Delete this message from your mailbox?",
    );
    if (!shouldDelete) {
      return;
    }

    setDeletingId(selectedMessage.id);
    setFeedback(null);

    try {
      await deleteMessage(activeRole, selected.folder, selectedMessage.id);

      const currentFolderMessages =
        selected.folder === "inbox" ? mailbox.inbox : mailbox.sent;
      const remainingMessages = currentFolderMessages.filter(
        (message) => message.id !== selectedMessage.id,
      );
      const otherMessages =
        selected.folder === "inbox" ? mailbox.sent : mailbox.inbox;

      setMailbox((current) => ({
        ...current,
        [selected.folder]: remainingMessages,
      }));

      if (remainingMessages[0]) {
        setSelected({
          folder: selected.folder,
          id: remainingMessages[0].id,
        });
      } else if (otherMessages[0]) {
        setSelected({
          folder: selected.folder === "inbox" ? "sent" : "inbox",
          id: otherMessages[0].id,
        });
      } else {
        setSelected(null);
      }

      setFeedback({ type: "success", text: "Message deleted." });
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "The message could not be deleted.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  function handleReply() {
    if (!selectedMessage) {
      return;
    }

    const subject = selectedMessage.subject.replace(/^Re:\s*/i, "");
    setComposeDefaults({
      eventId: selectedMessage.eventId,
      receiverId: selectedMessage.senderId,
      subject: `Re: ${subject}`,
      isReply: true,
    });
    setFeedback(null);
  }

  if (mailbox.status === "loading") {
    return (
      <main className="messaging-page">
        <section className="messaging-state" aria-live="polite">
          <h1>Messaging</h1>
          <p>Loading messages...</p>
        </section>
      </main>
    );
  }

  if (mailbox.status === "error") {
    return (
      <main className="messaging-page">
        <section className="messaging-state" role="alert">
          <h1>Messaging</h1>
          <p>{mailbox.error}</p>
          <button className="messaging-button" type="button" onClick={handleRetry}>
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="messaging-page">
      <header className="messaging-page__header">
        <div>
          <h1>Messaging</h1>
          <p>Contact people connected to your events and bookings.</p>
        </div>
        <button
          className="messaging-button messaging-button--primary"
          type="button"
          onClick={() => {
            setComposeDefaults({});
            setFeedback(null);
          }}
        >
          New message
        </button>
      </header>

      {feedback ? (
        <p
          className={`messaging-feedback${feedback.type === "error" ? " messaging-feedback--error" : ""}`}
          role={feedback.type === "error" ? "alert" : undefined}
          aria-live="polite"
        >
          {feedback.text}
        </p>
      ) : null}

      <div className="messaging-layout">
        <aside className="messaging-sidebar" aria-label="Message folders">
          <MessageList
            folder="inbox"
            messages={mailbox.inbox}
            selectedId={selected?.folder === "inbox" ? selected.id : undefined}
            onSelect={(folder, message) => {
              void handleSelect(folder, message);
            }}
          />
          <MessageList
            folder="sent"
            messages={mailbox.sent}
            selectedId={selected?.folder === "sent" ? selected.id : undefined}
            onSelect={(folder, message) => {
              void handleSelect(folder, message);
            }}
          />
        </aside>

        <section className="messaging-content" aria-label="Selected message">
          {composeDefaults ? (
            <ComposeForm
              key={`${composeDefaults.isReply ? "reply" : "new"}-${composeDefaults.receiverId ?? "none"}`}
              contacts={mailbox.contacts}
              defaults={composeDefaults}
              isSending={isSending}
              onCancel={() => {
                setComposeDefaults(null);
                setFeedback(null);
              }}
              onSend={handleSend}
            />
          ) : selectedMessage && selected ? (
            <MessageDetails
              folder={selected.folder}
              message={selectedMessage}
              isDeleting={deletingId === selectedMessage.id}
              onDelete={() => {
                void handleDelete();
              }}
              onReply={handleReply}
            />
          ) : (
            <div className="messaging-content__empty">
              <h2>No message selected</h2>
              <p>Select a message or create a new one.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
