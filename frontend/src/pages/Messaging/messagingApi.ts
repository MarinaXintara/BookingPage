import type { Role } from "../../Auth/Authentication";

export type MessageFolder = "inbox" | "sent";

export interface MessageContact {
  userId: number;
  name: string;
  eventId: number;
  eventTitle: string;
}

export interface Message {
  id: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  eventId: number;
  eventTitle: string;
  subject: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageInput {
  receiverId: number;
  eventId: number;
  subject: string;
  body: string;
}

interface MockMailbox {
  contacts: MessageContact[];
  inbox: Message[];
  sent: Message[];
}

const MOCK_DELAY_MS = 180;

// MOCK BACKEND START
// Replace the data and exported function bodies below with fetch requests when
// the messaging backend is available. The UI does not use mock data directly.
const mockMailboxes: Record<Role, MockMailbox> = {
  ADMIN: {
    contacts: [
      {
        userId: 2,
        name: "Olivia Papadopoulos",
        eventId: 21,
        eventTitle: "Open Air Cinema",
      },
      {
        userId: 3,
        name: "Nikos Georgiou",
        eventId: 11,
        eventTitle: "Summer Concert",
      },
    ],
    inbox: [],
    sent: [],
  },
  USER: {
    contacts: [
      {
        userId: 101,
        name: "Πασχαλίδης",
        eventId: 11,
        eventTitle: "Summer Concert",
      },
      {
        userId: 102,
        name: "Μέγαρο Μουσικής",
        eventId: 12,
        eventTitle: "Athens Classical Evening",
      },
      {
        userId: 103,
        name: "Jazz Bar",
        eventId: 13,
        eventTitle: "Friday Jazz Night",
      },
    ],
    inbox: [
      {
        id: "user-inbox-1",
        senderId: 101,
        senderName: "Πασχαλίδης",
        receiverId: 1,
        receiverName: "You",
        eventId: 11,
        eventTitle: "Summer Concert",
        subject: "Your booking is confirmed",
        body: "Your booking has been confirmed. Please arrive 20 minutes before the event begins.",
        isRead: true,
        createdAt: "2026-07-28T10:15:00+03:00",
      },
      {
        id: "user-inbox-2",
        senderId: 102,
        senderName: "Μέγαρο Μουσικής",
        receiverId: 1,
        receiverName: "You",
        eventId: 12,
        eventTitle: "Athens Classical Evening",
        subject: "Entrance information",
        body: "The main entrance will open at 19:00. You can show your booking confirmation at the door.",
        isRead: false,
        createdAt: "2026-07-30T17:40:00+03:00",
      },
    ],
    sent: [
      {
        id: "user-sent-1",
        senderId: 1,
        senderName: "You",
        receiverId: 103,
        receiverName: "Jazz Bar",
        eventId: 13,
        eventTitle: "Friday Jazz Night",
        subject: "Changing my reservation",
        body: "Hello, can I change the number of tickets in my reservation?",
        isRead: true,
        createdAt: "2026-07-29T12:05:00+03:00",
      },
    ],
  },
  ORGANIZER: {
    contacts: [
      {
        userId: 201,
        name: "Maria Papadopoulou",
        eventId: 21,
        eventTitle: "Open Air Cinema",
      },
      {
        userId: 202,
        name: "Nikos Georgiou",
        eventId: 21,
        eventTitle: "Open Air Cinema",
      },
      {
        userId: 203,
        name: "Eleni Dimitriou",
        eventId: 22,
        eventTitle: "City Food Festival",
      },
    ],
    inbox: [
      {
        id: "organizer-inbox-1",
        senderId: 201,
        senderName: "Maria Papadopoulou",
        receiverId: 2,
        receiverName: "You",
        eventId: 21,
        eventTitle: "Open Air Cinema",
        subject: "Accessible seating",
        body: "Hello, is accessible seating available near the entrance?",
        isRead: false,
        createdAt: "2026-07-30T09:25:00+03:00",
      },
      {
        id: "organizer-inbox-2",
        senderId: 203,
        senderName: "Eleni Dimitriou",
        receiverId: 2,
        receiverName: "You",
        eventId: 22,
        eventTitle: "City Food Festival",
        subject: "Ticket question",
        body: "Can I use the same booking confirmation for all three tickets?",
        isRead: true,
        createdAt: "2026-07-27T14:10:00+03:00",
      },
    ],
    sent: [
      {
        id: "organizer-sent-1",
        senderId: 2,
        senderName: "You",
        receiverId: 202,
        receiverName: "Nikos Georgiou",
        eventId: 21,
        eventTitle: "Open Air Cinema",
        subject: "Event schedule update",
        body: "The screening will begin at 21:15 instead of 21:00.",
        isRead: true,
        createdAt: "2026-07-28T16:30:00+03:00",
      },
    ],
  },
};

function waitForMock(signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request aborted", "AbortError"));
      return;
    }

    const onAbort = () => {
      window.clearTimeout(timeoutId);
      reject(new DOMException("Request aborted", "AbortError"));
    };
    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, MOCK_DELAY_MS);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function copyMessages(messages: Message[]): Message[] {
  return messages.map((message) => ({ ...message }));
}

export async function getInbox(
  role: Role,
  signal?: AbortSignal,
): Promise<Message[]> {
  await waitForMock(signal);
  return copyMessages(mockMailboxes[role].inbox);
}

export async function getSentMessages(
  role: Role,
  signal?: AbortSignal,
): Promise<Message[]> {
  await waitForMock(signal);
  return copyMessages(mockMailboxes[role].sent);
}

export async function getAvailableRecipients(
  role: Role,
  signal?: AbortSignal,
): Promise<MessageContact[]> {
  await waitForMock(signal);
  return mockMailboxes[role].contacts.map((contact) => ({ ...contact }));
}

export async function sendMessage(
  role: Role,
  input: SendMessageInput,
): Promise<Message> {
  await waitForMock();

  const contact = mockMailboxes[role].contacts.find(
    (candidate) =>
      candidate.userId === input.receiverId &&
      candidate.eventId === input.eventId,
  );

  if (!contact) {
    throw new Error("The selected recipient is not available for this event.");
  }

  const message: Message = {
    id: `mock-message-${Date.now()}`,
    senderId: role === "ORGANIZER" ? 2 : 1,
    senderName: "You",
    receiverId: contact.userId,
    receiverName: contact.name,
    eventId: contact.eventId,
    eventTitle: contact.eventTitle,
    subject: input.subject.trim(),
    body: input.body.trim(),
    isRead: true,
    createdAt: new Date().toISOString(),
  };

  mockMailboxes[role].sent = [message, ...mockMailboxes[role].sent];
  return { ...message };
}

export async function markMessageAsRead(
  role: Role,
  messageId: string,
): Promise<void> {
  await waitForMock();
  const message = mockMailboxes[role].inbox.find(
    (candidate) => candidate.id === messageId,
  );

  if (!message) {
    throw new Error("The message could not be found.");
  }

  message.isRead = true;
}

export async function deleteMessage(
  role: Role,
  folder: MessageFolder,
  messageId: string,
): Promise<void> {
  await waitForMock();
  const mailbox = mockMailboxes[role];
  const messages = folder === "inbox" ? mailbox.inbox : mailbox.sent;

  if (!messages.some((message) => message.id === messageId)) {
    throw new Error("The message could not be found.");
  }

  if (folder === "inbox") {
    mailbox.inbox = messages.filter((message) => message.id !== messageId);
  } else {
    mailbox.sent = messages.filter((message) => message.id !== messageId);
  }
}
// MOCK BACKEND END
